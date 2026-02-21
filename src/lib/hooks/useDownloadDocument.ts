import api from "@/lib/api/client"

export function useDownloadDocument() {
  async function downloadDocument(downloadUrl: string, fileName: string) {
    const res = await api.get(downloadUrl, { responseType: "blob" })
    const url = window.URL.createObjectURL(res.data)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return { downloadDocument }
}
