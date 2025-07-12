'use client'
import React from 'react'
import { Menu } from '@/api/MainApi'

interface Props {
  menu: Menu
  title: string
  isSelected: boolean
  onClick: () => void
}

export const MenuCard: React.FC<Props> = ({ menu, title, isSelected, onClick }) => (
  <div 
    className={`menu-card bg-white text-gray-800 rounded-lg shadow-xl p-6 flex flex-col items-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 ${
      isSelected ? 'ring-4 ring-rose-400 shadow-2xl scale-105 bg-gradient-to-br from-rose-50 to-white' : ''
    }`}
    onClick={onClick}
  >
    <h3 className={`text-3xl font-bold mb-4 text-center transition-colors duration-300 ${
      isSelected ? 'text-rose-600' : 'hover:text-rose-500'
    }`}>{title}</h3>
    <ul className="menu-list w-full">
      {menu.foods.map(food => (
        <li key={food.foodId} className={`transition-colors duration-200 ${isSelected ? 'bg-rose-100' : 'hover:bg-rose-50'}`}>
          {food.foodName}
          {food.mainSub !== '일반메뉴' && <span className="text-xs text-gray-500 ml-2">({food.mainSub})</span>}
        </li>
      ))}
    </ul>
  </div>
)
