import { Card, Empty, Image, List, Skeleton, Space, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { moneyFormat } from '@repo/util';
import { useCartItemsQuery } from '@repo/hooks';

const { Text, Title } = Typography;

const getProductName = (item: any) =>
  item?.productName || item?.name || item?.skuName || item?.title || '---';

const getProductImage = (item: any) =>
  item?.image || item?.thumbnail || item?.productImage || item?.skuImage;

const getQuantity = (item: any) => item?.quantity || item?.amount || item?.qty || 0;

const getPrice = (item: any) =>
  item?.price || item?.unitPrice || item?.salePrice || item?.totalPrice || 0;

const CartsPage = () => {
  const { data, isLoading } = useCartItemsQuery({ page: 0, size: 50 });
  const rows = data?.data || [];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Title level={4} style={{ margin: 0 }}>
          Giỏ hàng <Text type="secondary">({data?.total || rows.length})</Text>
        </Title>
      </Card>

      {isLoading ? (
        <Card>
          <Skeleton active />
        </Card>
      ) : (
        <List
          dataSource={rows}
          locale={{ emptyText: <Empty image={<ShoppingCartOutlined />} description="Giỏ hàng trống" /> }}
          renderItem={(item: any) => {
            const image = getProductImage(item);
            return (
              <List.Item style={{ padding: 0, borderBlockEnd: 0, marginBottom: 12 }}>
                <Card style={{ width: '100%' }}>
                  <Space align="start" style={{ width: '100%' }}>
                    {image ? (
                      <Image
                        src={image}
                        width={64}
                        height={64}
                        preview={false}
                        style={{ objectFit: 'cover', borderRadius: 8 }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ShoppingCartOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
                    )}
                    <Space direction="vertical" size={2} style={{ minWidth: 0 }}>
                      <Text strong ellipsis={{ tooltip: getProductName(item) }}>
                        {getProductName(item)}
                      </Text>
                      <Text type="secondary">Số lượng: {getQuantity(item)}</Text>
                      <Text>{moneyFormat(getPrice(item))}</Text>
                    </Space>
                  </Space>
                </Card>
              </List.Item>
            );
          }}
        />
      )}
    </Space>
  );
};

export default CartsPage;
