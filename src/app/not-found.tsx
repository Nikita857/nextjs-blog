"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Страница не найдена</p>
        <Button
          as={Link}
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
        >
          Вернуться на главную
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
