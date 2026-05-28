import type { ComponentProps } from 'react';
import { PackagesMobileView } from './PackagesShared';

type PackagesStyleDefaultProps = {
  page: ComponentProps<typeof PackagesMobileView>['page'];
};

export const PackagesStyleDefault = ({ page }: PackagesStyleDefaultProps) => (
  <PackagesMobileView page={page} />
);
