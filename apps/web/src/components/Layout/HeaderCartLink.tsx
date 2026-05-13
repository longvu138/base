import { Link } from "react-router-dom";
import { useTranslation } from "@repo/i18n";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useTotalSkusInCart } from "@repo/hooks";
import { useTheme } from "@repo/theme-provider";

export const HeaderCartLink = () => {
  const { t } = useTranslation();
  const { tenantConfig } = useTheme();
  const { data: totalSkus } = useTotalSkusInCart();
  const orderConfig = tenantConfig?.tenantConfig?.orderConfig || {};

  const quantity = totalSkus?.quantity || 0;

  if (orderConfig.disable) return null;

  return (
    <Link
      to="/carts"
      className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-normal text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
    >
      <ShoppingCartOutlined className="text-base text-red-500" />
      <span>{t("header.cart")}</span>
      <span className="font-bold text-gray-900 dark:text-gray-100">
        {quantity > 999 ? "999+" : quantity}
      </span>
      <span>{t("header.product")}</span>
    </Link>
  );
};

export default HeaderCartLink;
