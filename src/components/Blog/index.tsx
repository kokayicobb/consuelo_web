const Blog = () => {
  return (
    <section id = 'blog' className="pb-10 pt-20 lg:pb-0 lg:pt-[120px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          {/* {blogData.map((blog) => (
            <div key={blog.id} className="w-full px-4 md:w-1/2 lg:w-1/3">
              <SingleBlog blog={blog} />
            </div>
          ))} */}
        </div>
      </div>
    </section>
  );
};

export default Blog;
