import { ShoppingCartOutlined } from "@ant-design/icons";
import { Badge, Button, theme } from "antd";
import { useTotalSkusInCart } from "@repo/hooks";
import { useTheme } from "@repo/theme-provider";
import { useNavigate } from "react-router-dom";

export const HeaderCartLink = () => {
  const { tenantConfig } = useTheme();
  const { token } = theme.useToken();
  const { data: totalSkus } = useTotalSkusInCart();
  const navigate = useNavigate();
  const orderConfig = tenantConfig?.tenantConfig?.orderConfig || {};

  const quantity = totalSkus?.quantity || 0;

  if (orderConfig.disable) return null;
  return (
    <Badge count={quantity} size="small">
      <Button
        type="text"
        icon={<ShoppingCartOutlined />}
        onClick={() => navigate("/carts")}
        style={{ color: token.colorTextSecondary }}
      />
    </Badge>
  );
};

export default HeaderCartLink;
