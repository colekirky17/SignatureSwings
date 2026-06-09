import "server-only";

type ShopifyAdminConfiguration = {
  endpoint: string;
  accessToken: string;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type UserError = {
  field?: string[] | null;
  message: string;
};

type StagedUploadTarget = {
  url: string;
  resourceUrl: string;
  parameters: Array<{ name: string; value: string }>;
};

type ShopifyImageFile = {
  id: string;
  fileStatus: "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
  url: string | null;
};

export type UploadedCustomerFile = {
  fileId: string;
  url: string;
};

function getAdminConfiguration(): ShopifyAdminConfiguration | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  const apiVersion = process.env.SHOPIFY_API_VERSION?.trim();

  if (!domain || !accessToken || !apiVersion) {
    return null;
  }

  const storeDomain = domain.replace(/^https?:\/\//i, "").replace(/\/+$/, "");

  if (
    !/^[a-z0-9.-]+$/i.test(storeDomain) ||
    !/^(?:\d{4}-\d{2}|latest|unstable)$/.test(apiVersion)
  ) {
    return null;
  }

  return {
    endpoint: `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`,
    accessToken,
  };
}

export function isShopifyFileUploadConfigured(): boolean {
  return Boolean(getAdminConfiguration());
}

async function queryAdmin<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T | null> {
  const configuration = getAdminConfiguration();

  if (!configuration) {
    return null;
  }

  try {
    const response = await fetch(configuration.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": configuration.accessToken,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    const result = (await response.json()) as GraphqlResponse<T>;

    if (!response.ok || result.errors?.length || !result.data) {
      console.error("Shopify Admin file request failed.", result.errors);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Shopify Admin file request failed.", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

function getUserError(errors: UserError[]): string | null {
  return errors[0]?.message ?? null;
}

async function createStagedUpload(
  filename: string,
  mimeType: string,
  fileSize: number,
): Promise<StagedUploadTarget | null> {
  const data = await queryAdmin<{
    stagedUploadsCreate: {
      stagedTargets: StagedUploadTarget[];
      userErrors: UserError[];
    };
  }>(
    `
      mutation CustomerLogoStagedUpload($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      input: [
        {
          filename,
          mimeType,
          fileSize: String(fileSize),
          httpMethod: "POST",
          resource: "IMAGE",
        },
      ],
    },
  );

  const payload = data?.stagedUploadsCreate;

  if (!payload || payload.userErrors.length) {
    console.error(
      "Shopify could not create a staged upload.",
      getUserError(payload?.userErrors ?? []),
    );
    return null;
  }

  return payload.stagedTargets[0] ?? null;
}

async function uploadToStagedTarget(target: StagedUploadTarget, file: File) {
  const body = new FormData();

  for (const parameter of target.parameters) {
    body.append(parameter.name, parameter.value);
  }

  body.append("file", file, file.name);

  const response = await fetch(target.url, {
    method: "POST",
    body,
  });

  return response.ok;
}

async function createShopifyFile(
  resourceUrl: string,
  alt: string,
): Promise<ShopifyImageFile | null> {
  const data = await queryAdmin<{
    fileCreate: {
      files: ShopifyImageFile[];
      userErrors: UserError[];
    };
  }>(
    `
      mutation CreateCustomerLogoFile($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            fileStatus
            ... on MediaImage {
              image {
                url
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      files: [
        {
          alt,
          contentType: "IMAGE",
          originalSource: resourceUrl,
        },
      ],
    },
  );

  const payload = data?.fileCreate;

  if (!payload || payload.userErrors.length) {
    console.error(
      "Shopify could not create the uploaded file.",
      getUserError(payload?.userErrors ?? []),
    );
    return null;
  }

  const file = payload.files[0] as
    | (Omit<ShopifyImageFile, "url"> & { image?: { url?: string | null } | null })
    | undefined;

  return file
    ? {
        id: file.id,
        fileStatus: file.fileStatus,
        url: file.image?.url ?? null,
      }
    : null;
}

async function getShopifyFile(fileId: string): Promise<ShopifyImageFile | null> {
  const data = await queryAdmin<{
    node:
      | (Omit<ShopifyImageFile, "url"> & {
          image?: { url?: string | null } | null;
        })
      | null;
  }>(
    `
      query CustomerLogoFile($id: ID!) {
        node(id: $id) {
          ... on MediaImage {
            id
            fileStatus
            image {
              url
            }
          }
        }
      }
    `,
    { id: fileId },
  );

  return data?.node
    ? {
        id: data.node.id,
        fileStatus: data.node.fileStatus,
        url: data.node.image?.url ?? null,
      }
    : null;
}

async function waitForReadyFile(
  initialFile: ShopifyImageFile,
): Promise<ShopifyImageFile | null> {
  let currentFile = initialFile;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (currentFile.fileStatus === "READY" && currentFile.url) {
      return currentFile;
    }

    if (currentFile.fileStatus === "FAILED") {
      return null;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    const refreshedFile = await getShopifyFile(currentFile.id);

    if (!refreshedFile) {
      return null;
    }

    currentFile = refreshedFile;
  }

  return null;
}

export async function uploadCustomerLogoToShopify(
  file: File,
  storedFilename: string,
  originalFilename: string,
): Promise<UploadedCustomerFile | null> {
  if (!getAdminConfiguration()) {
    console.error("Shopify Admin file uploads are not configured.");
    return null;
  }

  const target = await createStagedUpload(storedFilename, file.type, file.size);

  if (!target || !(await uploadToStagedTarget(target, file))) {
    return null;
  }

  const createdFile = await createShopifyFile(
    target.resourceUrl,
    `Customer engraving artwork: ${originalFilename}`,
  );

  if (!createdFile) {
    return null;
  }

  const readyFile = await waitForReadyFile(createdFile);

  return readyFile?.url
    ? {
        fileId: readyFile.id,
        url: readyFile.url,
      }
    : null;
}
