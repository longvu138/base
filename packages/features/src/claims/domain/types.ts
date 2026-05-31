import type { useClaimsModel } from "../model/useClaimsModel";
import type { useClaimsMobileModel } from "../model/useClaimsMobileModel";

export type ClaimsModel = ReturnType<typeof useClaimsModel>;
export type ClaimsMobileModel = ReturnType<typeof useClaimsMobileModel>;
