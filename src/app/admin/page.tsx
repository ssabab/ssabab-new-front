// src/app/admin/page.tsx (또는 원하는 위치)
'use client'

import MenuRegisterForm from '@/component/admin/MenuRegister'
import OcrUploader from '@/component/admin/OCRUploader'

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 py-8 gap-8">
      {/* OCR Uploader 영역 */}
      <section className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">OCR로 메뉴 업로드</h2>
        <OcrUploader />
      </section>
      {/* 메뉴 등록 영역 */}
      <section className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">메뉴 수동 등록</h2>
        <MenuRegisterForm />
      </section>
    </div>
  )
}
