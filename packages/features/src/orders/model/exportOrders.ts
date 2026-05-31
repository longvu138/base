export const downloadOrdersBlob = (response: any) => {
  const disposition = response.headers?.["content-disposition"] || "";
  const fileName =
    disposition.split("filename=")[1]?.replaceAll('"', "") ||
    `orders_${Date.now()}.xlsx`;
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", decodeURIComponent(fileName));
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getExportErrorTitle = async (error: any) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      return JSON.parse(text)?.title;
    } catch {
      return "";
    }
  }
  return data?.title || error?.title;
};
