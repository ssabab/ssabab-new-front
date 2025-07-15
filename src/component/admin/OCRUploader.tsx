import api from "@/api/Admin"
import { ParsedMenu, getThisWeekDates } from "@/utils/menuUtils"
import { useState } from "react"
import MenuRegister from "./MenuRegister"

// OCR API 응답 타입 정의
interface OcrTable {
  "요일": string[]
  "메뉴1_한식": string[][]
  "메뉴2_일품": string[][]
}
interface OcrResponse {
  tables: OcrTable[]
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

export default function OCRUploader() {
  const [parsedMenus, setParsedMenus] = useState<ParsedMenu[] | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  // OCR 백엔드 응답을 파싱해서 원하는 구조로 변환
  const parseOcrTables = (data: OcrResponse): ParsedMenu[] => {
    const weekDates = getThisWeekDates()
    const tbl = data.tables?.[0]
    if (!tbl) return []

    const 한식: string[][] = tbl["메뉴1_한식"] || []
    const 일품: string[][] = tbl["메뉴2_일품"] || []

    // 길이 보정
    while (한식.length < 5) 한식.push([])
    while (일품.length < 5) 일품.push([])

    return weekDates.map((date, i) => ({
      date,
      foods: [
        한식[i] ?? [],
        일품[i] ?? []
      ]
    }))
  }

  const handleUpload = async (file: File) => {
    setError(null)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await api.post<OcrResponse>(`${BACKEND_URL}/api/v1/ocr`, form);
      console.log(res)
      setParsedMenus(parseOcrTables(res.data))
    } catch (e: any) {
      setError(e?.message || "OCR 실패")
      setParsedMenus(undefined)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
        }}
        className="mb-2"
      />
      {error && <div className="text-red-600">{error}</div>}
      <MenuRegister ocrMenus={parsedMenus} />
      {/* (디버그용) */}
      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">{parsedMenus && JSON.stringify(parsedMenus, null, 2)}</pre>
    </div>
  )
}
