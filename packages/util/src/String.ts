import linkifyHtml from "linkify-html"

export const linkify = (text: string) => {
  if (!text) return ""
  // let urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  // return text.replace(urlRegex, function(url) {
  //     return '<a target="_blank" href="' + url + '">' + url + '</a>';
  // });

  return linkifyHtml(text, {
    ignoreTags: ["script", "style", "img", "iframe"],
  })
}

export const checkIsLink = (text: string) => {
  if (!text) return false

  if (!text.startsWith("http")) return false

  const res = text.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)/g)
  if (res == null) return false
  else return true
}
