import {
  BankOutlined,
  HomeOutlined,
  MailOutlined,
  MobileOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Flex,
  Layout as AntLayout,
  Row,
  Space,
  Typography,
  theme,
} from "antd";
import { useLayoutFooter } from "./hooks/useLayoutFooter";

const { Text, Paragraph } = Typography;

export const FooterStyleDefault = () => {
  const { token } = theme.useToken();
  const footer = useLayoutFooter();
  const hasCustomFooter = Boolean(footer.customFooterHtml);

  return (
    <AntLayout.Footer
      style={{
        padding: 0,
        background: hasCustomFooter
          ? token.colorFillQuaternary
          : token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      {hasCustomFooter ? (
        <div
          style={{ padding: token.paddingLG }}
          dangerouslySetInnerHTML={{ __html: footer.customFooterHtml }}
        />
      ) : (
        <div style={{ padding: token.paddingLG }}>
          <Row gutter={[token.marginXL, token.marginLG]}>
            <Col xs={24} md={6}>
              <Space direction="vertical" size="small">
                <Text strong style={{ color: token.colorPrimary }}>
                  <MailOutlined /> {footer.t("footer.contact")}
                </Text>
                {footer.emailContact && (
                  <Text>
                    Email: <Text strong>{footer.emailContact}</Text>
                  </Text>
                )}
                {footer.phoneContacts.length > 0 && (
                  <Space align="start">
                    <Text type="secondary">
                      <PhoneOutlined /> {footer.t("footer.phone")}:
                    </Text>
                    <Space direction="vertical" size={2}>
                      {footer.phoneContacts.map((phone: string) => (
                        <Text key={phone}>{phone}</Text>
                      ))}
                    </Space>
                  </Space>
                )}
              </Space>
            </Col>

            <Col xs={24} md={6}>
              <Space direction="vertical" size="small">
                <Text strong style={{ color: token.colorPrimary }}>
                  <HomeOutlined /> {footer.t("footer.address")}
                </Text>
                <Paragraph style={{ margin: 0 }}>
                  {footer.addressContact}
                </Paragraph>
              </Space>
            </Col>

            <Col xs={24} md={6}>
              <Space direction="vertical" size="small">
                <Text strong style={{ color: token.colorPrimary }}>
                  <BankOutlined /> {footer.t("footer.bank_info")}
                </Text>
                <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {footer.bankAccount}
                </Paragraph>
              </Space>
            </Col>

            <Col xs={24} md={6}>
              <Flex justify="center" align="center" style={{ height: "100%" }}>
                <Button
                  type="primary"
                  ghost
                  icon={<MobileOutlined />}
                  onClick={footer.changeToMobileVersion}
                >
                  {footer.t("footer.change_mobile_version")}
                </Button>
              </Flex>
            </Col>
          </Row>
        </div>
      )}

      {hasCustomFooter && (
        <Flex justify="center" style={{ padding: token.paddingSM }}>
          <Button
            type="primary"
            ghost
            icon={<MobileOutlined />}
            onClick={footer.changeToMobileVersion}
          >
            {footer.t("footer.change_mobile_version")}
          </Button>
        </Flex>
      )}

      <Divider style={{ margin: 0 }} />
      <Flex
        justify="center"
        style={{
          padding: token.paddingSM,
          background: token.colorFillQuaternary,
        }}
      >
        <Text type="secondary">
          Copyright © {new Date().getFullYear()} {footer.projectName}
          {" - "}
          {footer.companyDescription}. Powered By {footer.tenantName}.
        </Text>
      </Flex>
    </AntLayout.Footer>
  );
};

export default FooterStyleDefault;
