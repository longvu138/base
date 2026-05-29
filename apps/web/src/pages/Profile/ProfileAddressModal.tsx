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
  onSaveSuccess?: (data: { isEdit: boolean; isReceivingAddress: boolean }) => void;
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

const getAddressErrorMessage = (error: any, t: (key: string) => string) => {
  const title = error?.response?.data?.title || error?.title;
  const message = error?.response?.data?.message || error?.message;

  if (title === "invalid_receiving_location") {
    return t("message.invalid_receiving_location");
  }
  if (title === "invalid_location") {
    return t("message.invalid_location");
  }
  if (title === "location_bad_request") {
    return t("message.location_incorrect");
  }
  if (message === "Network fail" || title === "Network fail") return null;

  return message ? t(message) : t("message.unconnected_error");
};

export const ProfileAddressModal: React.FC<ProfileAddressModalProps> = ({
  open,
  onClose,
  onSuccess,
  onSaveSuccess,
  initialValues,
  isEdit = false,
  isReceivingAddress = false,
  gobizMode = false,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { notification } = App.useApp();
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
          notification.warning({ message: t("message.any_change") });
          return;
        }
        await updateMutation.mutateAsync({
          id: initialValues.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      if (!onSaveSuccess) {
        notification.success({ message: t("message.success") });
      }
      await onSuccess?.();
      onClose();
      onSaveSuccess?.({ isEdit, isReceivingAddress });
    } catch (error: any) {
      const errorMessage = getAddressErrorMessage(error, t);
      if (errorMessage) notification.error({ message: errorMessage });
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

  const modalTitleKey = isReceivingAddress
    ? isEdit
      ? "customerAddress.editReceivingAddress"
      : "customerAddress.newReceivingAddress"
    : isEdit
      ? "customerAddress.edit_address"
      : "customerAddress.new_address";
  const modalTitle = gobizMode ? t(modalTitleKey).toUpperCase() : t(modalTitleKey);
  const okText = gobizMode
    ? (isEdit ? t("button.save") : t("button.add_address")).toUpperCase()
    : isEdit
      ? t("button.save")
      : t("button.add_address");
  const cancelText = gobizMode
    ? t("button.cancel").toUpperCase()
    : t("button.cancel");

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      width={760}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("customerAddress.fullname")}
              name="fullname"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t("customerAddress.fullname_required"),
                },
              ]}
            >
              <Input placeholder={t("customerAddress.fullname")} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("customerAddress.phone")}
              name="phone"
              rules={[
                {
                  required: true,
                  message: t("customerAddress.phone_required"),
                },
                {
                  pattern: phonePattern,
                  message: t("customerAddress.invalid_phone"),
                },
              ]}
            >
              <Input placeholder={t("customerAddress.phone")} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("customerAddress.country")}
              name="country"
              rules={[
                {
                  required: true,
                  message: t("customerAddress.country_required"),
                },
              ]}
            >
              <Select
                disabled={countryOptions.length === 1}
                loading={loadingCountries}
                notFoundContent={selectNotFound(loadingCountries)}
                onChange={handleCountryChange}
                options={countryOptions}
                placeholder={t("customerAddress.select_country")}
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
              label={t("customerAddress.province")}
              name="province"
              rules={[
                {
                  required: true,
                  message: t("customerAddress.province_required"),
                },
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
                placeholder={t("customerAddress.select_province")}
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
                label={t("customerAddress.city")}
                name="city"
                rules={[
                  {
                    required: true,
                    message: t("customerAddress.city_required"),
                  },
                ]}
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
                  placeholder={t("customerAddress.select_city")}
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
              label={t("customerAddress.district")}
              name="district"
              rules={[
                {
                  required: true,
                  message: t("customerAddress.district_required"),
                },
              ]}
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
                placeholder={t("customerAddress.select_district")}
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
              label={t("customerAddress.ward")}
              name="ward"
              rules={[
                { required: true, message: t("customerAddress.ward_required") },
              ]}
            >
              <Select
                disabled={!districtCode}
                loading={loadingWards}
                notFoundContent={selectNotFound(loadingWards)}
                options={wards.map((item: any) => ({
                  label: item.name,
                  value: item.code,
                }))}
                placeholder={t("customerAddress.select_ward")}
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
              label={t("customerAddress.address")}
              name="detail"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t("customerAddress.address_required"),
                },
              ]}
            >
              <Input placeholder={t("customerAddress.address")} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("customerAddress.addressName")}
              name="addressName"
            >
              <Input placeholder={t("customerAddress.addressName")} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("customerAddress.zipCode")}
              name="zipCode"
              rules={[
                {
                  pattern: phonePattern,
                  message: t("customerAddress.invalid_zip_code"),
                },
              ]}
            >
              <Input maxLength={10} placeholder={t("customerAddress.zipCode")} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="note">
          <Input.TextArea
            maxLength={1000}
            placeholder={t("customerAddress.note")}
            rows={3}
          />
        </Form.Item>

        <Form.Item name="defaultAddress" valuePropName="checked">
          <Checkbox disabled={!!initialValues?.defaultAddress}>
            {t("customerAddress.set_default")}
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};
