import type { ComponentProps } from 'react';
import { PackagesMobileView } from './PackagesShared';

type PackagesStyleThanhlaProps = {
  page: ComponentProps<typeof PackagesMobileView>['page'];
};

export const PackagesStyleThanhla = ({ page }: PackagesStyleThanhlaProps) => (
  <PackagesMobileView page={page} />
);
