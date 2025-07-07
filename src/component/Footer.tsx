import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; 2025 오늘의 메뉴. 모든 권리 보유.</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 rounded-lg">개인정보처리방침</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 rounded-lg">이용약관</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 rounded-lg">문의</a>
        </div>
      </div>
    </footer>
  );
}
