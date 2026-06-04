"use server";

import type { MemberMutationResult } from "../member-api";
import { memberApi } from "../member-api";

const restrictedFields = new Set([
  "fullName",
  "email",
  "mobile",
  "nationalIdNumber",
  "dateOfBirth",
  "physicalAddress"
]);

export type ProfileChangeRequestInput = {
  field: string;
  currentValue: string;
  requestedValue: string;
  reason?: string;
};

function invalidResult(message: string): MemberMutationResult {
  return {
    ok: false,
    backendReady: true,
    message,
    status: 400
  };
}

export async function submitProfileChangeRequest(input: ProfileChangeRequestInput): Promise<MemberMutationResult> {
  if (!restrictedFields.has(input.field)) {
    return invalidResult("This field cannot be submitted for approval.");
  }

  if (!input.requestedValue.trim()) {
    return invalidResult("Enter the requested value before submitting.");
  }

  if (input.currentValue.trim() === input.requestedValue.trim()) {
    return invalidResult("The requested value must be different from the current value.");
  }

  return memberApi.submitProfileChangeRequest({
    field: input.field,
    currentValue: input.currentValue,
    requestedValue: input.requestedValue.trim(),
    reason: input.reason?.trim() || undefined
  });
}

export async function uploadProfileImage(formData: FormData): Promise<MemberMutationResult<{ imageUrl?: string }>> {
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return invalidResult("Choose an image before confirming.") as MemberMutationResult<{ imageUrl?: string }>;
  }

  if (!file.type.startsWith("image/")) {
    return invalidResult("Choose a valid image file.") as MemberMutationResult<{ imageUrl?: string }>;
  }

  if (file.size > 2 * 1024 * 1024) {
    return invalidResult("Choose an image smaller than 2 MB.") as MemberMutationResult<{ imageUrl?: string }>;
  }

  const upload = new FormData();
  upload.append("image", file);

  return memberApi.uploadProfileImage<{ imageUrl?: string }>(upload);
}
