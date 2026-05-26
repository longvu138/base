import React, { useEffect, useMemo, useState } from "react";
import {
  App,
  Checkbox,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Spin,
} from "antd";
import {
  useCreateAddressMutation,
  useLocationsQuery,
  useUpdateAddressMutation,
} from "@repo/hooks";
import { useTranslation } from "@repo/i18n";
import type { QueryObserverResult } from "@tanstack/react-query";

interface ProfileAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<
    QueryObserverResult<{ data: any[]; total: number }, Error>
  >;
  initialValues?: any;
  isEdit?: boolean;
  isReceivingAddress?: boolean;
  gobizMode?: boolean;
}

const phonePattern = /^[0-9+.() -]+$/;

const getLocationCode = (address: any, position: number) => {
  let location = address?.location;
  const chain = [];

  while (location) {
    chain.unshift(location);
    location = location.parent;
  }

  return chain[position]?.code || null;
};

const trimValue = (value: any) =>
  typeof value === "string" ? value.trim() : value;

const getInitialAddressSnapshot = (
  address: any,
  countryCode?: string | null,
) => {
  if (!address) return null;

  const country =
    countryCode || address.countryCode || getLocationCode(address, 0) || "VN";
  const wardPosition = country === "CN" ? 4 : 3;

  return {
    addressName: address.addressName || address.label || "",
    defaultAddress: !!(address.defaultAddress ?? address.isDefault),
    detail: address.detail || address.address || "",
    fullname: address.fullname || address.fullName || address.contactName || "",
    location: address.wardCode || getLocationCode(address, wardPosition),
    note: address.note || "",
    phone: address.phone || address.contactPhone || "",
    receivingAddress: !!address.receivingAddress,
    zipCode: address.zipCode || address.postalCode || "",
  };
};

export const ProfileAddressModal: React.FC<ProfileAddressModalProps> = ({
  open,
  onClose,
  onSuccess,
  initialValues,
  isEdit = false,
  isReceivingAddress = false,
  gobizMode = false,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateAddressMutation();
  const updateMutation = useUpdateAddressMutation();

  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [cityCode, setCityCode] = useState<string | null>(null);
  const [districtCode, setDistrictCode] = useState<string | null>(null);

  const { data: countries = [], isLoading: loadingCountries } =
    useLocationsQuery({
      allCountries: true,
      size: 1000,
      type: "COUNTRY",
    });
  const { data: provinces = [], isLoading: loadingProvinces } =
    useLocationsQuery({
      parent: countryCode,
      size: 1000,
    });
  const { data: cities = [], isLoading: loadingCities } = useLocationsQuery({
    parent: countryCode === "CN" ? provinceCode : null,
    size: 1000,
  });
  const { data: districts = [], isLoading: loadingDistricts } =
    useLocationsQuery({
      parent: countryCode === "CN" ? cityCode : provinceCode,
      size: 1000,
    });
  const { data: wards = [], isLoading: loadingWards } = useLocationsQuery({
    parent: districtCode,
    size: 1000,
  });

  const countryOptions = useMemo(
    () =>
      countries
        .filter((item: any) => !item?.ghost)
        .map((item: any) => ({ label: item.name, value: item.code })),
    [countries],
  );

  useEffect(() => {
    if (!open || countries.length !== 1 || countryCode) return;

    const onlyCountry = countries[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountryCode(onlyCountry.code);
    form.setFieldsValue({ country: onlyCountry.code });
  }, [countries, countryCode, form, open]);

  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      const country =
        initialValues.countryCode || getLocationCode(initialValues, 0) || "VN";
      const province =
        initialValues.provinceCode || getLocationCode(initialValues, 1);
      const districtPosition = country === "CN" ? 3 : 2;
      const wardPosition = country === "CN" ? 4 : 3;
      const city =
        country === "CN"
          ? initialValues.cityCode || getLocationCode(initialValues, 2)
          : null;
      const district =
        initialValues.districtCode ||
        getLocationCode(initialValues, districtPosition);
      const ward =
        initialValues.wardCode || getLocationCode(initialValues, wardPosition);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCountryCode(country);
      setProvinceCode(province);
      setCityCode(city);
      setDistrictCode(district);
      form.setFieldsValue({
        addressName: initialValues.addressName || initialValues.label,
        country,
        defaultAddress: initialValues.defaultAddress ?? initialValues.isDefault,
        detail: initialValues.detail || initialValues.address,
        district,
        fullname:
          initialValues.fullname ||
          initialValues.fullName ||
          initialValues.contactName,
        note: initialValues.note,
        phone: initialValues.phone || initialValues.contactPhone,
        province,
        city,
        ward,
        zipCode: initialValues.zipCode || initialValues.postalCode,
      });
      return;
    }

    form.resetFields();
    setCountryCode(null);
    setProvinceCode(null);
    setCityCode(null);
    setDistrictCode(null);
    form.setFieldsValue({ defaultAddress: false });
  }, [form, initialValues, open]);

  const resetProvinceDown = () => {
    setProvinceCode(null);
    setCityCode(null);
    setDistrictCode(null);
    form.setFieldsValue({
      province: null,
      city: null,
      district: null,
      ward: null,
    });
  };

  const handleCountryChange = (value: string) => {
    setCountryCode(value);
    resetProvinceDown();
  };

  const handleProvinceChange = (value: string) => {
    setProvinceCode(value);
    setCityCode(null);
    setDistrictCode(null);
    form.setFieldsValue({ city: null, district: null, ward: null });
  };

  const handleCityChange = (value: string) => {
    setCityCode(value);
    setDistrictCode(null);
    form.setFieldsValue({ district: null, ward: null });
  };

  const handleDistrictChange = (value: string) => {
    setDistrictCode(value);
    form.setFieldsValue({ ward: null });
  };

  const onFinish = async (values: any) => {
    const payload = {
      addressName: trimValue(values.addressName) || "",
      defaultAddress: !!values.defaultAddress,
      detail: trimValue(values.detail),
      fullname: trimValue(values.fullname),
      location: values.ward,
      note: trimValue(values.note) || "",
      phone: values.phone,
      receivingAddress: isReceivingAddress,
      zipCode: values.zipCode || "",
    };

    try {
      if (isEdit && initialValues?.id) {
        const initialSnapshot = getInitialAddressSnapshot(
          initialValues,
          countryCode,
        );
        if (
          initialSnapshot &&
          payload.addressName === initialSnapshot.addressName &&
          payload.defaultAddress === initialSnapshot.defaultAddress &&
          payload.detail === initialSnapshot.detail &&
          payload.fullname === initialSnapshot.fullname &&
          payload.location === initialSnapshot.location &&
          payload.note === initialSnapshot.note &&
          payload.phone === initialSnapshot.phone &&
          payload.receivingAddress === initialSnapshot.receivingAddress &&
          payload.zipCode === initialSnapshot.zipCode
        ) {
          message.warning("Không có sự thay đổi");
          return;
        }
        await updateMutation.mutateAsync({
          id: initialValues.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      message.success("Thành công");
      await onSuccess?.();
      onClose();
    } catch (error: any) {
      message.error(
          error?.response?.data?.message ||
          error?.response?.data?.title ||
          error?.message ||
          "Có lỗi xảy ra, vui lòng thử lại",
      );
    }
  };

  const selectNotFound = (loading: boolean) =>
    loading ? (
      <div style={{ textAlign: "center" }}>
        <Spin />
      </div>
    ) : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );

  const modalTitle = gobizMode
    ? isEdit
      ? t("customerAddress.edit_address").toUpperCase()
      : t("customerAddress.new_address").toUpperCase()
    : isEdit
      ? "CẬP NHẬT ĐỊA CHỈ"
      : "THÊM ĐỊA CHỈ MỚI";
  const okText = gobizMode
    ? (isEdit ? t("button.save") : t("button.add_address")).toUpperCase()
    : isEdit
      ? "LƯU"
      : "THÊM ĐỊA CHỈ";
  const cancelText = gobizMode ? t("button.cancel").toUpperCase() : "HỦY BỎ";

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      width="min(760px, calc(100vw - 32px))"
      centered
      styles={{
        body: {
          maxHeight: "calc(100vh - 220px)",
          overflowX: "hidden",
          overflowY: "auto",
        },
      }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Họ tên"
              name="fullname"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập họ tên",
                },
              ]}
            >
              <Input placeholder="Họ tên" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: phonePattern,
                  message: "Số điện thoại không đúng định dạng",
                },
              ]}
            >
              <Input placeholder="Điện thoại" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Quốc gia"
              name="country"
              rules={[{ required: true, message: "Vui lòng chọn quốc gia" }]}
            >
              <Select
                disabled={countryOptions.length === 1}
                loading={loadingCountries}
                notFoundContent={selectNotFound(loadingCountries)}
                onChange={handleCountryChange}
                options={countryOptions}
                placeholder="Chọn quốc gia"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Tỉnh/Thành phố"
              name="province"
              rules={[
                { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
              ]}
            >
              <Select
                disabled={!countryCode}
                loading={loadingProvinces}
                notFoundContent={selectNotFound(loadingProvinces)}
                onChange={handleProvinceChange}
                options={provinces.map((item: any) => ({
                  label: item.name,
                  value: item.code,
                }))}
                placeholder="Chọn tỉnh/thành phố"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          {countryCode === "CN" && (
            <Col xs={24} md={12}>
              <Form.Item
                label="Thành phố"
                name="city"
                rules={[{ required: true, message: "Vui lòng chọn thành phố" }]}
              >
                <Select
                  disabled={!provinceCode}
                  loading={loadingCities}
                  notFoundContent={selectNotFound(loadingCities)}
                  onChange={handleCityChange}
                  options={cities.map((item: any) => ({
                    label: item.name,
                    value: item.code,
                  }))}
                  placeholder="Chọn thành phố"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          )}
          <Col xs={24} md={12}>
            <Form.Item
              label="Quận/Huyện"
              name="district"
              rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
            >
              <Select
                disabled={countryCode === "CN" ? !cityCode : !provinceCode}
                loading={loadingDistricts}
                notFoundContent={selectNotFound(loadingDistricts)}
                onChange={handleDistrictChange}
                options={districts.map((item: any) => ({
                  label: item.name,
                  value: item.code,
                }))}
                placeholder="Chọn quận/huyện"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Phường/Xã"
              name="ward"
              rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
            >
              <Select
                disabled={!districtCode}
                loading={loadingWards}
                notFoundContent={selectNotFound(loadingWards)}
                options={wards.map((item: any) => ({
                  label: item.name,
                  value: item.code,
                }))}
                placeholder="Chọn phường/xã"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Địa chỉ"
              name="detail"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập địa chỉ",
                },
              ]}
            >
              <Input placeholder="Địa chỉ" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Tên địa chỉ" name="addressName">
              <Input placeholder="Tên địa chỉ" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Mã bưu chính"
              name="zipCode"
              rules={[
                {
                  pattern: phonePattern,
                  message: "Mã bưu chính không đúng định dạng",
                },
              ]}
            >
              <Input maxLength={10} placeholder="Mã bưu chính" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="note">
          <Input.TextArea maxLength={1000} placeholder="Ghi chú" rows={3} />
        </Form.Item>

        <Form.Item name="defaultAddress" valuePropName="checked">
          <Checkbox disabled={!!initialValues?.defaultAddress}>
            Đặt làm địa chỉ mặc định
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};
