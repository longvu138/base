const isJSONString = (str: any) => {
  if (typeof str !== "string") {
    return false
  }

  try {
    const parsed = JSON.parse(str)
    return typeof parsed === "object" && parsed !== null // Phải là object hoặc array
  } catch (error) {
    console.error(error)
    return false // Lỗi khi parse
  }
}

export const JsonUtils = {
  isJSONString,
}
