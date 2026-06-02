import { ConfigProvider } from "antd";
import { CartCheckoutStyleDefault } from "./CartCheckoutStyleDefault";

export const CartCheckoutStyleGobiz = () => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            borderRadiusLG: 6,
            paddingLG: 18,
          },
          Button: {
            borderRadius: 6,
            controlHeightLG: 44,
          },
          Table: {
            headerBg: "#f8fafc",
            headerColor: "#334155",
          },
        },
      }}
    >
      <div className="mx-auto max-w-[1600px] p-6 pt-2">
        <CartCheckoutStyleDefault />
      </div>
    </ConfigProvider>
  );
};

export default CartCheckoutStyleGobiz;
