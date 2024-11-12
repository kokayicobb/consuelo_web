import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <>
      <section
        id="home"
        className="relative overflow-hidden bg-primary pt-[120px] md:pt-[130px] lg:pt-[160px]"
      >
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4">
              <div
                className="hero-content wow fadeInUp mx-auto max-w-[780px] text-center"
                data-wow-delay=".2s"
              >
                <h1 className="mb-6 text-3xl font-bold leading-snug text-white sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-[1.2]">
                  AI-Powered Size Software to Reduce Returns and Boost Sales
                </h1>
                <p className="mx-auto mb-9 max-w-[600px] text-base font-medium text-white sm:text-lg sm:leading-[1.44]">
                  Empower your shoppers with AI-driven size guidance that
                  transforms online shopping. Enhance their confidence, reduce
                  returns, and be the brand that nails the perfect fit every
                  time.
                </p>
                <ul className="mb-10 flex flex-wrap items-center justify-center gap-5">
                  <li>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-md bg-white px-7 py-[14px] text-center text-base font-medium text-dark shadow-1 transition duration-300 ease-in-out hover:bg-gray-2"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      target="_blank"
                      className="flex items-center gap-4 rounded-md bg-white/[0.12] px-6 py-[14px] text-base font-medium text-white transition duration-300 ease-in-out hover:bg-white hover:text-dark"
                    >
                      Request a Demo
                    </Link>
                  </li>
                </ul>

                <div>
                  <p className="mb-4 text-center text-base font-medium text-white/60">
                    Consuelo is now available for all popular platforms
                  </p>
                  <div
                    className="wow fadeInUp flex items-center justify-center gap-4 text-center"
                    data-wow-delay=".3s"
                  >
                    <a
                      href="https://shopify.com"
                      className="text-white/60 duration-300 ease-in-out hover:text-white"
                      target="_blank"
                    >
                      <svg
                        className="fill-current"
                        width="41"
                        height="32"
                        viewBox="0 0 120 120"
                        preserveAspectRatio="xMidYMid meet"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M95.9 23.9c-0.1-0.6-0.6-1-1.1-1-0.5 0-9.3-0.2-9.3-0.2s-7.4-7.2-8.1-7.9c-0.7-0.7-2.2-0.5-2.7-0.3c0 0-1.4 0.4-3.7 1.1c-0.4-1.3-1-2.8-1.8-4.4c-2.6-5-6.5-7.7-11.1-7.7c0 0 0 0 0 0c-0.3 0-0.6 0-1 0.1c-0.1-0.2-0.3-0.3-0.4-0.5c-2-2.2-4.6-3.2-7.7-3.1c-6 0.2-12 4.5-16.8 12.2c-3.4 5.4-6 12.2-6.8 17.5c-6.9 2.1-11.7 3.6-11.8 3.7c-3.5 1.1-3.6 1.2-4 4.5c-0.3 2.5-9.5 73-9.5 73l76.4 13.2l33.1-8.2C109.5 115.8 96 24.5 95.9 23.9z"
                        />

                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M58 39.9 l -3.8 14.4 c 0 0 -4.3 -2 -9.4 -1.6 c -7.5 0.5 -7.5 5.2 -7.5 6.4 c 0.4 6.4 17.3 7.8 18.3 22.9 c 0.7 11.9 -6.3 20 -16.4 20.6 c -12.2 0.8 -18.9 -6.4 -18.9 -6.4 l 2.6 -11 c 0 0 6.7 5.1 12.1 4.7 c 3.5 -0.2 4.8 -3.1 4.7 -5.1 c -0.5 -8.4 -14.3 -7.9 -15.2 -21.7 c -0.7 -11.6 6.9 -23.4 23.7 -24.4 C 54.7 38.2 58 39.9 58 39.9 Z"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M 94.8 22.9 c -0.5 0 -9.3 -0.2 -9.3 -0.2 s -7.4 -7.2 -8.1 -7.9 c -0.3 -0.3 -0.6 -0.4 -1 -0.5 l 0 109.7 l 33.1 -8.2 c 0 0 -13.5 -91.3 -13.6 -92 C 95.8 23.3 95.3 22.9 94.8 22.9 Z"
                        />
                      </svg>
                    </a>

                    <a
                      href="https://woocommerce.com/"
                      className="text-white/60 duration-300 ease-in-out hover:text-white"
                      target="_blank"
                    >
                      <svg
                        className="fill-current"
                        width="45"
                        height="32"
                        viewBox="0 0 200 120"
                        
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M 157.267 0 L 16.0963 0 C 7.16235 0 -0.0698779 7.30311 0.000509458 16.1662 L 0.000509458 70.0534 C 0.000509458 78.9871 7.23326 86.2194 16.1672 86.2194 L 83.0297 86.2194 L 113.59 103.236 L 106.641 86.2194 L 157.267 86.2194 C 166.201 86.2194 173.433 78.9871 173.433 70.0534 L 173.433 16.1662 C 173.433 7.2322 166.201 0 157.267 0 Z M 13.1186 12.4791 C 11.1333 12.6209 9.64428 13.33 8.65163 14.6771 C 7.65899 15.9534 7.30448 17.5842 7.51717 19.4277 C 11.7005 46.017 15.6002 63.9556 19.2164 73.2441 C 20.6345 76.6473 22.2653 78.2785 24.1797 78.1366 C 27.1576 77.9237 30.7028 73.8114 34.8862 65.7992 C 37.0842 61.261 40.4877 54.4546 45.0964 45.3786 C 48.9251 58.7794 54.1719 68.8481 60.7663 75.5839 C 62.61 77.4982 64.5243 78.3491 66.3675 78.2073 C 67.9986 78.0655 69.2746 77.2146 70.1255 75.6546 C 70.8346 74.3075 71.1182 72.7475 70.9764 70.975 C 70.5509 64.5229 71.1894 55.518 72.9619 43.9606 C 74.8051 32.0487 77.0742 23.4693 79.8394 18.3642 C 80.4067 17.3006 80.6192 16.237 80.5485 14.9608 C 80.4067 13.3299 79.6976 11.9828 78.3506 10.9192 C 77.0035 9.85568 75.5142 9.35936 73.8835 9.50113 C 71.8273 9.64295 70.2673 10.6356 69.2039 12.6209 C 64.8079 20.6331 61.6879 33.6086 59.8447 51.6182 C 57.1501 44.8115 54.881 36.7993 53.1085 27.369 C 52.3287 23.1857 50.4144 21.2003 47.2944 21.4131 C 45.1673 21.5548 43.3947 22.9729 41.9766 25.6673 L 26.4486 55.2344 C 23.896 44.9532 21.4853 32.4032 19.2873 17.5842 C 18.791 13.8972 16.7347 12.1955 13.1186 12.4791 Z M 149.751 17.5844 C 154.785 18.648 158.543 21.3424 161.096 25.8093 C 163.365 29.6382 164.499 34.247 164.499 39.7775 C 164.499 47.0804 162.656 53.7455 158.968 59.8433 C 154.714 66.9338 149.184 70.4788 142.306 70.4788 C 141.101 70.4788 139.825 70.337 138.477 70.0534 C 133.443 68.99 129.685 66.2958 127.132 61.8288 C 124.864 57.9289 123.729 53.2494 123.729 47.7895 C 123.729 40.4865 125.573 33.8215 129.26 27.7947 C 133.585 20.7042 139.115 17.159 145.922 17.159 C 147.128 17.159 148.404 17.3008 149.751 17.5844 Z M 146.773 55.9435 C 149.397 53.6037 151.169 50.1293 152.162 45.4497 C 152.446 43.819 152.658 42.0464 152.658 40.2029 C 152.658 38.1467 152.233 35.9487 151.382 33.7506 C 150.318 30.9853 148.9 29.4964 147.198 29.1418 C 144.646 28.6455 142.164 30.0636 139.825 33.5379 C 137.91 36.2322 136.705 39.0684 136.067 41.9755 C 135.712 43.6063 135.57 45.3791 135.57 47.1516 C 135.57 49.2077 135.995 51.4057 136.846 53.6037 C 137.91 56.3689 139.328 57.8578 141.03 58.2126 C 142.802 58.5669 144.717 57.7871 146.773 55.9435 Z M 116.639 25.8093 C 114.086 21.3424 110.257 18.648 105.294 17.5844 C 103.946 17.3008 102.671 17.159 101.465 17.159 C 94.6584 17.159 89.1279 20.7042 84.8027 27.7947 C 81.1154 33.8215 79.2722 40.4865 79.2722 47.7895 C 79.2722 53.2494 80.4067 57.9289 82.6754 61.8288 C 85.2281 66.2958 88.9861 68.99 94.02 70.0534 C 95.3671 70.337 96.6435 70.4788 97.8491 70.4788 C 104.727 70.4788 110.257 66.9338 114.511 59.8433 C 118.199 53.7455 120.042 47.0804 120.042 39.7775 C 120.042 34.247 118.907 29.6382 116.639 25.8093 Z M 107.704 45.4497 C 106.712 50.1293 104.939 53.6037 102.316 55.9435 C 100.26 57.7871 98.3453 58.5669 96.5728 58.2126 C 94.8709 57.8578 93.4527 56.3689 92.3893 53.6037 C 91.5384 51.4057 91.1129 49.2077 91.1129 47.1516 C 91.1129 45.3791 91.2548 43.6063 91.6095 41.9755 C 92.2475 39.0684 93.4527 36.2322 95.3671 33.5379 C 97.7073 30.0636 100.189 28.6455 102.741 29.1418 C 104.443 29.4964 105.861 30.9853 106.925 33.7506 C 107.776 35.9487 108.201 38.1467 108.201 40.2029 C 108.201 42.0464 108.059 43.819 107.704 45.4497 Z"
                        />
                      </svg>
                    </a>

                    <a
                      href="https://squarespace.com/"
                      className="text-white/60 duration-300 ease-in-out hover:text-white"
                      target="_blank"
                    >
                      <svg
                        className="fill-current"
                        width="41"
                        height="38"
                        viewBox="0 0 275 275"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M 162.931 40.6692 C 158.108 35.8462 150.287 35.8462 145.467 40.6692 L 66.8701 119.269 C 57.2189 128.912 41.5825 128.912 31.939 119.269 C 22.2853 109.622 22.2853 93.9835 31.939 84.3324 L 109.023 7.2486 C 99.3768 -2.39999 83.7353 -2.39999 74.0892 7.2486 L 14.4671 66.8681 C -4.82238 86.1628 -4.82238 117.438 14.4671 136.735 C 33.7617 156.03 65.0371 156.03 84.3317 136.735 L 162.931 58.136 C 167.751 53.313 167.751 45.4923 162.931 40.6692 L 162.931 40.6692 Z M 189.13 14.4729 C 169.835 -4.8243 138.56 -4.8243 119.265 14.4729 L 40.6686 93.0671 C 35.8481 97.8875 35.8481 105.713 40.6686 110.534 C 45.4916 115.357 53.3098 115.357 58.1328 110.534 L 136.735 31.9397 C 146.381 22.2911 162.017 22.2911 171.661 31.9397 C 176.489 36.7601 184.307 36.7601 189.13 31.9397 C 193.953 27.1115 193.953 19.2959 189.13 14.4729 L 189.13 14.4729 Z M 215.331 93.0671 C 210.508 88.2492 202.685 88.2492 197.862 93.0671 L 119.265 171.664 C 109.619 181.31 93.9778 181.31 84.3317 171.664 C 79.5113 166.843 71.6931 166.843 66.8701 171.664 C 62.0394 176.489 62.0394 184.31 66.8701 189.128 C 86.157 208.423 117.44 208.423 136.735 189.128 L 215.331 110.534 C 220.152 105.713 220.152 97.8875 215.331 93.0671 L 215.331 93.0671 Z M 241.533 66.8707 C 222.238 47.5786 190.958 47.5786 171.668 66.8707 L 93.0664 145.47 C 88.2434 150.288 88.2434 158.114 93.0664 162.934 C 97.892 167.76 105.713 167.76 110.533 162.934 L 189.13 84.3375 C 198.773 74.6889 214.417 74.6889 224.061 84.3375 C 233.707 93.9835 233.707 109.622 224.061 119.269 L 146.977 196.355 C 156.623 205.998 172.257 205.998 181.911 196.355 L 241.533 136.735 C 260.822 117.438 260.822 86.1628 241.533 66.8707 L 241.533 66.8707 Z"
                        />
                      </svg>
                    </a>


                    <a
                      href="https://wix.com/"
                      className="text-white/60 duration-300 ease-in-out hover:text-white"
                      target="_blank"
                    >
                      <svg
                        className="fill-current"
                        width="41"
                        height="38"
                        viewBox="0 0 275 275"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M 0 0.230967 C 0 0.230967 20.2953 -2.32903 33.8256 9.6568 C 42.177 17.0514 44.6111 28.8358 44.6111 28.8358 L 72.2424 136.415 L 95.2236 48.3674 C 97.4563 39.0087 101.494 27.4341 107.873 19.6114 C 116.014 9.64841 132.541 9.0189 134.303 9.0189 C 136.066 9.0189 152.584 9.64841 160.718 19.6114 C 167.097 27.4341 171.134 39.0003 173.375 48.3674 L 196.356 136.415 L 223.979 28.8358 C 223.979 28.8358 226.422 17.0514 234.773 9.6568 C 248.303 -2.32903 268.59 0.230967 268.59 0.230967 L 215.678 201.279 C 215.678 201.279 198.228 202.547 189.49 198.073 C 178.017 192.197 172.569 187.665 165.619 160.302 C 162.107 146.307 158.638 132.301 155.212 118.285 L 153.911 113.005 C 150.243 98.0481 146.583 83.1498 144.006 72.7839 L 142.747 67.7478 C 141.589 63.1818 140.792 60.1098 140.506 59.1865 C 139.726 56.6601 138.794 50.642 134.295 50.642 C 129.897 50.642 128.881 56.6685 128.084 59.1865 C 127.79 60.1098 126.993 63.1734 125.843 67.7478 L 124.584 72.7839 C 121.904 83.5556 119.246 94.3328 116.61 105.115 L 115.318 110.37 C 111.253 127.029 107.14 143.676 102.979 160.311 C 96.0294 187.665 90.5736 192.206 79.0998 198.073 C 70.3622 202.547 52.9123 201.279 52.9123 201.279 L 0 0.230967 L 0 0.230967 Z M 318.934 33.5781 L 318.934 40.8384 L 318.951 40.8384 L 318.951 162.199 C 318.858 187.103 316.45 192.634 305.975 198.367 C 297.833 202.823 285.377 201.136 285.377 201.136 L 285.377 65.1878 C 285.377 58.3639 287.492 53.8902 295.29 49.8782 C 299.948 47.4777 304.287 45.6395 308.803 42.92 C 314.972 39.2269 318.103 34.8371 318.791 33.7963 L 318.934 33.5781 Z M 335.738 0.902442 C 335.738 0.902442 363.075 -3.94057 376.614 8.87621 C 384.227 16.0862 392.645 28.3742 394.551 31.2112 L 394.911 31.7483 L 394.953 31.8155 L 418.791 67.538 C 419.941 69.3929 421.452 71.4158 423.869 71.4158 C 426.278 71.4158 427.797 69.4013 428.955 67.538 L 452.784 31.8155 L 452.826 31.7483 L 453.187 31.2112 C 455.092 28.3742 463.511 16.0862 471.132 8.86782 C 484.663 -3.94057 512 0.894049 512 0.894049 L 447.228 101.078 L 511.824 200.935 C 511.824 200.935 483.857 204.678 470.318 191.862 C 461.656 183.67 452.784 170.332 452.784 170.332 L 428.947 134.618 C 427.797 132.755 426.278 130.732 423.869 130.732 C 421.452 130.732 419.941 132.747 418.782 134.618 L 394.953 170.332 C 394.953 170.332 386.568 183.67 377.915 191.862 C 364.376 204.678 335.906 200.935 335.906 200.935 L 400.501 101.078 L 335.738 0.902442 L 335.738 0.902442 Z M 318.867 0.00434368 L 318.951 0.00434368 C 318.951 13.3499 317.692 21.2817 309.634 27.4425 C 305.894 30.3173 301.769 32.6538 297.38 34.3839 C 292.929 36.1201 288.854 38.6961 285.377 41.9716 C 285.377 17.6641 288.927 8.85943 298.471 3.6471 C 304.405 0.407229 314.15 0.0379175 317.65 0.00434368 L 318.867 0.00434368 L 318.867 0.00434368 Z"
                        />
                      </svg>
                    </a>

                    {/* <a
                      href="https://shopify.com"
                      className="text-white/60 duration-300 ease-in-out hover:text-white"
                      target="_blank"
                    >
                      <svg
                        className="fill-current"
                        width="41"
                        height="102"
                        viewBox="0 0 720 320"
                        preserveAspectRatio="xMidYMid meet"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="m 201.1 174.5 c 7.3 0 12.2 3.3 15.2 7.4 v -58.4 c 0 -1.1 -1.3 -1.8 -2.2 -1.1 l -72.1 52.7 h 1.9 c 7.5 0 11.3 4.8 11.3 10 c 0 4.1 -2.1 7.1 -5 8.4 c -0.5 0.2 -0.5 0.9 0 1.1 c 3.3 1.4 5.7 4.9 5.7 9.1 c 0 6 -3.9 10.7 -11.4 10.7 h -20.5 c -0.4 0 -0.8 -0.3 -0.8 -0.8 v -24.8 l -53.7 39.3 c -0.9 0.8 -0.5 2.2 0.7 2.2 h 144.8 c 0.7 0 1.2 -0.5 1.2 -1.2 v -19.9 c -3.9 3.6 -9 5.9 -15.2 5.9 c -11.6 0 -21 -8 -21 -20.3 c 0.1 -12.4 9.6 -20.3 21.1 -20.3 Z m -28.7 39.2 c 0 0.4 -0.3 0.7 -0.7 0.7 h -6.9 c -0.4 0 -0.7 -0.3 -0.7 -0.7 v -37.9 c 0 -0.4 0.3 -0.7 0.7 -0.7 h 6.9 c 0.4 0 0.7 0.3 0.7 0.7 Z"
                        />

                       
                      </svg>
                    </a> */}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full px-4">
              <div
                className="wow fadeInUp relative z-10 mx-auto max-w-[845px]"
                data-wow-delay=".25s"
              >
                <div className="mt-16">
                  <Image
                    src="/images/hero/hero-image.png"
                    alt="hero"
                    className="mx-auto max-w-full rounded-t-xl rounded-tr-xl"
                    width={845}
                    height={316}
                  />
                </div>
                <div className="absolute -left-9 bottom-0 z-[-1]">
                  <svg
                    width="134"
                    height="106"
                    viewBox="0 0 134 106"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="1.66667"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 1.66667 104)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 16.3333 104)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 31 104)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 45.6667 104)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 60.3333 104)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 88.6667 104)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 117.667 104)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 74.6667 104)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 103 104)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 132 104)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="89.3333"
                      r="1.66667"
                      transform="rotate(-90 1.66667 89.3333)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="89.3333"
                      r="1.66667"
                      transform="rotate(-90 16.3333 89.3333)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="89.3333"
                      r="1.66667"
                      transform="rotate(-90 31 89.3333)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="89.3333"
                      r="1.66667"
                      transform="rotate(-90 45.6667 89.3333)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="89.3338"
                      r="1.66667"
                      transform="rotate(-90 60.3333 89.3338)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="89.3338"
                      r="1.66667"
                      transform="rotate(-90 88.6667 89.3338)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="89.3338"
                      r="1.66667"
                      transform="rotate(-90 117.667 89.3338)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="89.3338"
                      r="1.66667"
                      transform="rotate(-90 74.6667 89.3338)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="89.3338"
                      r="1.66667"
                      transform="rotate(-90 103 89.3338)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="89.3338"
                      r="1.66667"
                      transform="rotate(-90 132 89.3338)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="74.6673"
                      r="1.66667"
                      transform="rotate(-90 1.66667 74.6673)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="31.0003"
                      r="1.66667"
                      transform="rotate(-90 1.66667 31.0003)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 16.3333 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="31.0003"
                      r="1.66667"
                      transform="rotate(-90 16.3333 31.0003)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 31 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="31.0003"
                      r="1.66667"
                      transform="rotate(-90 31 31.0003)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 45.6667 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="31.0003"
                      r="1.66667"
                      transform="rotate(-90 45.6667 31.0003)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 60.3333 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="31.0001"
                      r="1.66667"
                      transform="rotate(-90 60.3333 31.0001)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 88.6667 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="31.0001"
                      r="1.66667"
                      transform="rotate(-90 88.6667 31.0001)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 117.667 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="31.0001"
                      r="1.66667"
                      transform="rotate(-90 117.667 31.0001)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 74.6667 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="31.0001"
                      r="1.66667"
                      transform="rotate(-90 74.6667 31.0001)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 103 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="31.0001"
                      r="1.66667"
                      transform="rotate(-90 103 31.0001)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 132 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="31.0001"
                      r="1.66667"
                      transform="rotate(-90 132 31.0001)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 1.66667 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 1.66667 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 16.3333 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 16.3333 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 31 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 31 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 45.6667 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 45.6667 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 60.3333 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 60.3333 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 88.6667 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 88.6667 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 117.667 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 117.667 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 74.6667 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 74.6667 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 103 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 103 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 132 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 132 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="45.3336"
                      r="1.66667"
                      transform="rotate(-90 1.66667 45.3336)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="1.66683"
                      r="1.66667"
                      transform="rotate(-90 1.66667 1.66683)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="45.3336"
                      r="1.66667"
                      transform="rotate(-90 16.3333 45.3336)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="1.66683"
                      r="1.66667"
                      transform="rotate(-90 16.3333 1.66683)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="45.3336"
                      r="1.66667"
                      transform="rotate(-90 31 45.3336)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="1.66683"
                      r="1.66667"
                      transform="rotate(-90 31 1.66683)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="45.3336"
                      r="1.66667"
                      transform="rotate(-90 45.6667 45.3336)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="1.66683"
                      r="1.66667"
                      transform="rotate(-90 45.6667 1.66683)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="45.3338"
                      r="1.66667"
                      transform="rotate(-90 60.3333 45.3338)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="1.66707"
                      r="1.66667"
                      transform="rotate(-90 60.3333 1.66707)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="45.3338"
                      r="1.66667"
                      transform="rotate(-90 88.6667 45.3338)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="1.66707"
                      r="1.66667"
                      transform="rotate(-90 88.6667 1.66707)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="45.3338"
                      r="1.66667"
                      transform="rotate(-90 117.667 45.3338)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="1.66707"
                      r="1.66667"
                      transform="rotate(-90 117.667 1.66707)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="45.3338"
                      r="1.66667"
                      transform="rotate(-90 74.6667 45.3338)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="1.66707"
                      r="1.66667"
                      transform="rotate(-90 74.6667 1.66707)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="45.3338"
                      r="1.66667"
                      transform="rotate(-90 103 45.3338)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="1.66707"
                      r="1.66667"
                      transform="rotate(-90 103 1.66707)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="45.3338"
                      r="1.66667"
                      transform="rotate(-90 132 45.3338)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="1.66707"
                      r="1.66667"
                      transform="rotate(-90 132 1.66707)"
                      fill="white"
                    />
                  </svg>
                </div>
                <div className="absolute -right-6 -top-6 z-[-1]">
                  <svg
                    width="134"
                    height="106"
                    viewBox="0 0 134 106"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="1.66667"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 1.66667 104)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 16.3333 104)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 31 104)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 45.6667 104)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 60.3333 104)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 88.6667 104)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 117.667 104)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 74.6667 104)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 103 104)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="104"
                      r="1.66667"
                      transform="rotate(-90 132 104)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="89.3333"
                      r="1.66667"
                      transform="rotate(-90 1.66667 89.3333)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="89.3333"
                      r="1.66667"
                      transform="rotate(-90 16.3333 89.3333)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="89.3333"
                      r="1.66667"
                      transform="rotate(-90 31 89.3333)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="89.3333"
                      r="1.66667"
                      transform="rotate(-90 45.6667 89.3333)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="89.3338"
                      r="1.66667"
                      transform="rotate(-90 60.3333 89.3338)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="89.3338"
                      r="1.66667"
                      transform="rotate(-90 88.6667 89.3338)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="89.3338"
                      r="1.66667"
                      transform="rotate(-90 117.667 89.3338)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="89.3338"
                      r="1.66667"
                      transform="rotate(-90 74.6667 89.3338)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="89.3338"
                      r="1.66667"
                      transform="rotate(-90 103 89.3338)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="89.3338"
                      r="1.66667"
                      transform="rotate(-90 132 89.3338)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="74.6673"
                      r="1.66667"
                      transform="rotate(-90 1.66667 74.6673)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="31.0003"
                      r="1.66667"
                      transform="rotate(-90 1.66667 31.0003)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 16.3333 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="31.0003"
                      r="1.66667"
                      transform="rotate(-90 16.3333 31.0003)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 31 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="31.0003"
                      r="1.66667"
                      transform="rotate(-90 31 31.0003)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 45.6667 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="31.0003"
                      r="1.66667"
                      transform="rotate(-90 45.6667 31.0003)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 60.3333 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="31.0001"
                      r="1.66667"
                      transform="rotate(-90 60.3333 31.0001)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 88.6667 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="31.0001"
                      r="1.66667"
                      transform="rotate(-90 88.6667 31.0001)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 117.667 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="31.0001"
                      r="1.66667"
                      transform="rotate(-90 117.667 31.0001)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 74.6667 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="31.0001"
                      r="1.66667"
                      transform="rotate(-90 74.6667 31.0001)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 103 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="31.0001"
                      r="1.66667"
                      transform="rotate(-90 103 31.0001)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="74.6668"
                      r="1.66667"
                      transform="rotate(-90 132 74.6668)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="31.0001"
                      r="1.66667"
                      transform="rotate(-90 132 31.0001)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 1.66667 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 1.66667 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 16.3333 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 16.3333 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 31 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 31 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 45.6667 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 45.6667 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 60.3333 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 60.3333 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 88.6667 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 88.6667 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 117.667 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 117.667 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 74.6667 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 74.6667 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 103 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 103 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="60.0003"
                      r="1.66667"
                      transform="rotate(-90 132 60.0003)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="16.3336"
                      r="1.66667"
                      transform="rotate(-90 132 16.3336)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="45.3336"
                      r="1.66667"
                      transform="rotate(-90 1.66667 45.3336)"
                      fill="white"
                    />
                    <circle
                      cx="1.66667"
                      cy="1.66683"
                      r="1.66667"
                      transform="rotate(-90 1.66667 1.66683)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="45.3336"
                      r="1.66667"
                      transform="rotate(-90 16.3333 45.3336)"
                      fill="white"
                    />
                    <circle
                      cx="16.3333"
                      cy="1.66683"
                      r="1.66667"
                      transform="rotate(-90 16.3333 1.66683)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="45.3336"
                      r="1.66667"
                      transform="rotate(-90 31 45.3336)"
                      fill="white"
                    />
                    <circle
                      cx="31"
                      cy="1.66683"
                      r="1.66667"
                      transform="rotate(-90 31 1.66683)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="45.3336"
                      r="1.66667"
                      transform="rotate(-90 45.6667 45.3336)"
                      fill="white"
                    />
                    <circle
                      cx="45.6667"
                      cy="1.66683"
                      r="1.66667"
                      transform="rotate(-90 45.6667 1.66683)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="45.3338"
                      r="1.66667"
                      transform="rotate(-90 60.3333 45.3338)"
                      fill="white"
                    />
                    <circle
                      cx="60.3333"
                      cy="1.66707"
                      r="1.66667"
                      transform="rotate(-90 60.3333 1.66707)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="45.3338"
                      r="1.66667"
                      transform="rotate(-90 88.6667 45.3338)"
                      fill="white"
                    />
                    <circle
                      cx="88.6667"
                      cy="1.66707"
                      r="1.66667"
                      transform="rotate(-90 88.6667 1.66707)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="45.3338"
                      r="1.66667"
                      transform="rotate(-90 117.667 45.3338)"
                      fill="white"
                    />
                    <circle
                      cx="117.667"
                      cy="1.66707"
                      r="1.66667"
                      transform="rotate(-90 117.667 1.66707)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="45.3338"
                      r="1.66667"
                      transform="rotate(-90 74.6667 45.3338)"
                      fill="white"
                    />
                    <circle
                      cx="74.6667"
                      cy="1.66707"
                      r="1.66667"
                      transform="rotate(-90 74.6667 1.66707)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="45.3338"
                      r="1.66667"
                      transform="rotate(-90 103 45.3338)"
                      fill="white"
                    />
                    <circle
                      cx="103"
                      cy="1.66707"
                      r="1.66667"
                      transform="rotate(-90 103 1.66707)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="45.3338"
                      r="1.66667"
                      transform="rotate(-90 132 45.3338)"
                      fill="white"
                    />
                    <circle
                      cx="132"
                      cy="1.66707"
                      r="1.66667"
                      transform="rotate(-90 132 1.66707)"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
