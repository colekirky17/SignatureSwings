export type PersonalizationAttribute = {
  key: string;
  value: string;
};

const PERSONALIZATION_METHOD_KEY = "Personalization Method";
export const CUSTOMIZATION_REQUIRED_KEY = "_Customization Required";

function includesProductTerm(handle: string, title: string, term: string): boolean {
  return handle.toLowerCase().includes(term) || title.toLowerCase().includes(term);
}

export function productRequiresCustomization(handle: string, title: string): boolean {
  return (
    includesProductTerm(handle, title, "ball-marker") ||
    includesProductTerm(handle, title, "ball marker") ||
    includesProductTerm(handle, title, "club-link") ||
    includesProductTerm(handle, title, "club link") ||
    includesProductTerm(handle, title, "divot")
  );
}

export function productRequiresCustomerDetails(handle: string, title: string): boolean {
  return (
    includesProductTerm(handle, title, "ball-marker") ||
    includesProductTerm(handle, title, "ball marker") ||
    includesProductTerm(handle, title, "club-link") ||
    includesProductTerm(handle, title, "club link")
  );
}

function getAttribute(
  attributes: PersonalizationAttribute[],
  key: string,
): string | undefined {
  return attributes.find((attribute) => attribute.key === key)?.value.trim();
}

export function hasCompleteCustomization(
  handle: string,
  title: string,
  attributes: PersonalizationAttribute[],
): boolean {
  const requiresCustomization =
    productRequiresCustomization(handle, title) ||
    getAttribute(attributes, CUSTOMIZATION_REQUIRED_KEY) === "Yes";

  if (!requiresCustomization) {
    return true;
  }

  const method = getAttribute(attributes, PERSONALIZATION_METHOD_KEY);

  if (!method) {
    return false;
  }

  if (
    productRequiresCustomerDetails(handle, title) &&
    (!getAttribute(attributes, "Name") || !getAttribute(attributes, "Phone Number"))
  ) {
    return false;
  }

  if (/design/i.test(method)) {
    return Boolean(getAttribute(attributes, "Design Request"));
  }

  if (/logo|image/i.test(method)) {
    return Boolean(getAttribute(attributes, "Logo Upload"));
  }

  return Boolean(
    getAttribute(attributes, "Initials / Short Text") ||
      getAttribute(attributes, "Name or Message"),
  );
}
