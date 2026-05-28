import type { ComponentProps } from 'react';
import { PackagesMobileView } from './PackagesShared';

type PackagesStyleGobizProps = {
  page: ComponentProps<typeof PackagesMobileView>['page'];
  isTabView?: boolean;
};

export const PackagesStyleGobiz = ({ page }: PackagesStyleGobizProps) => (
  <PackagesMobileView page={page} />
);
