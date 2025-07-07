// src/app/main/page.tsx
'use client'; // 클라이언트 컴포넌트로 지정

import React from 'react';
// Next.js에서 페이지 간 이동을 위해 'next/link' 컴포넌트를 사용하는 것이 일반적입니다.
// <a href="..."> 대신 <Link href="...">를 사용하는 것을 권장합니다.
// import Link from 'next/link';

export default function MainPage() {
  return (
    <>
      <style jsx global>{`
        .section-gradient-gold {
          background: linear-gradient(to right, #FFDAB9, #FFC0CB); /* Peach Puff to Pink */
        }
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); /* 그림자 효과를 더 부드럽게 */
        }
      `}</style>

        {/* SSABAB 서비스 소개 섹션 */}
        <section className="bg-white py-16 md:py-24 rounded-lg shadow-inner mx-4 my-8">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center md:space-x-12">
            <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">SSABAB 서비스</h2>
              <p className="text-gray-600 text-lg mb-6">
                SSABAB은 사용자들의 식사 메뉴 선택을 돕고, 식단 평가를 통해 더 나은 식사 경험을 제공하는 혁신적인 서비스입니다.
                매일 새로운 메뉴를 추천받고, 솔직한 리뷰를 남겨보세요. 당신의 소중한 의견이 모두의 식사를 풍요롭게 만듭니다.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300">
                SSABAB 더 알아보기
              </button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img src="https://placehold.co/500x500/87CEEB/FFFFFF?text=SSABAB+서비스" alt="SSABAB 서비스 이미지" className="w-full max-w-md rounded-lg shadow-xl" />
            </div>
          </div>
        </section>

        {/* 팀 해리네 소개 섹션 */}
        <section className="section-gradient-gold text-white py-16 md:py-24 rounded-lg shadow-inner mx-4 my-8">
          <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center md:space-x-12">
            <div className="md:w-1/2 flex justify-center">
              <img src="https://placehold.co/500x500/FFC0CB/FFFFFF?text=팀+해리네" alt="팀 해리네 이미지" className="w-full max-w-md rounded-lg shadow-xl" />
            </div>
            <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
              <h2 className="text-3xl md:text-5xl font-bold text-shadow mb-4">팀 해리네</h2>
              <p className="text-white text-lg mb-6">
                SSABAB은 열정적인 개발자들로 구성된 '팀 해리네'가 만들었습니다.
                사용자들에게 최고의 경험을 제공하기 위해 끊임없이 고민하고 노력하며,
                기술과 아이디어를 통해 더 나은 세상을 만들고자 합니다.
              </p>
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300">
                팀 해리네 소개
              </button>
            </div>
          </div>
        </section>

        {/* 기술 스택 섹션 */}
        <section className="bg-white py-16 md:py-24 rounded-lg shadow-inner mx-4 my-8">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">기술 스택</h2>
            <p className="text-gray-600 text-lg mb-12 max-w-3xl mx-auto">
              SSABAB은 최신 기술 스택을 활용하여 안정적이고 확장 가능한 서비스를 제공합니다.
              아래는 저희 서비스 구축에 사용된 주요 기술들입니다.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
              {/* Tech Stack Item: Next.js */}
              <div className="flex flex-col items-center p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img src="https://placehold.co/80x80/000000/FFFFFF?text=Next.js" alt="Next.js 로고" className="w-20 h-20 mb-3" />
                <p className="font-bold text-lg text-gray-800">Next.js</p>
              </div>
              {/* Tech Stack Item: Spring Boot */}
              <div className="flex flex-col items-center p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img src="https://placehold.co/80x80/6DB33F/FFFFFF?text=Spring" alt="Spring Boot 로고" className="w-20 h-20 mb-3" />
                <p className="font-bold text-lg text-gray-800">Spring Boot</p>
              </div>
              {/* Tech Stack Item: MySQL */}
              <div className="flex flex-col items-center p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img src="https://placehold.co/80x80/00758F/FFFFFF?text=MySQL" alt="MySQL 로고" className="w-20 h-20 mb-3" />
                <p className="font-bold text-lg text-gray-800">MySQL</p>
              </div>
              {/* Tech Stack Item: AWS */}
              <div className="flex flex-col items-center p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img src="https://placehold.co/80x80/FF9900/FFFFFF?text=AWS" alt="AWS 로고" className="w-20 h-20 mb-3" />
                <p className="font-bold text-lg text-gray-800">AWS</p>
              </div>
              {/* Tech Stack Item: Kubernetes (K8s) */}
              <div className="flex flex-col items-center p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img src="https://placehold.co/80x80/326CE5/FFFFFF?text=K8s" alt="Kubernetes 로고" className="w-20 h-20 mb-3" />
                <p className="font-bold text-lg text-gray-800">Kubernetes</p>
              </div>
              {/* Tech Stack Item: Prometheus */}
              <div className="flex flex-col items-center p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img src="https://placehold.co/80x80/E6522C/FFFFFF?text=Prometheus" alt="Prometheus 로고" className="w-20 h-20 mb-3" />
                <p className="font-bold text-lg text-gray-800">Prometheus</p>
              </div>
              {/* Tech Stack Item: Grafana */}
              <div className="flex flex-col items-center p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img src="https://placehold.co/80x80/F05A28/FFFFFF?text=Grafana" alt="Grafana 로고" className="w-20 h-20 mb-3" />
                <p className="font-bold text-lg text-gray-800">Grafana</p>
              </div>
              {/* Tech Stack Item: ELK Stack */}
              <div className="flex flex-col items-center p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img src="https://placehold.co/80x80/00BFB3/FFFFFF?text=ELK" alt="ELK Stack 로고" className="w-20 h-20 mb-3" />
                <p className="font-bold text-lg text-gray-800">ELK Stack</p>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
