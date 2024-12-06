'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbProps {
  pageName: string
  pageDescription?: string
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ pageName, pageDescription }) => {
  return (
    <div className="relative z-10 overflow-hidden bg-gradient-to-b from-white to-gray-100 pb-8 pt-24 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            {pageName}
          </h1>
          {pageDescription && (
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
              {pageDescription}
            </p>
          )}
        </motion.div>

        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center"
        >
          <ol className="flex items-center space-x-2 rounded-lg bg-white px-4 py-2 shadow-md dark:bg-gray-800">
            <li>
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                <Home className="mr-1 h-4 w-4" />
                <span>Home</span>
              </Link>
            </li>
            <li className="flex items-center text-gray-500 dark:text-gray-400">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li className="text-gray-700 dark:text-gray-300">{pageName}</li>
          </ol>
        </motion.nav>
      </div>
      
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    </div>
  )
}

export default Breadcrumb