import React from "react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

interface Blog {
  title: string;
  coverImage: string;
  excerpt: string;
  date: string;
  slug: string;
}

interface BlogSectionProps {
  subtitle?: string;
  title?: string;
  paragraph?: string;
  width?: string;
  center?: boolean;
  posts: Blog[];
}

const BlogSection = ({ 
  subtitle = "Our Blogs",
  title = "Our Recent News",
  paragraph = "Discover how Consuelo is Building a Modern Shopping Experience with our curated selections, user-friendly design, and commitment to making fashion accessible to all.",
  width = "640px",
  center = true,
  posts
}: BlogSectionProps) => {
  return (
    <section className="bg-background py-20 lg:py-[120px]">
      <div className="container mx-auto">
        <div className="mb-16 flex flex-col items-center">
          <div className="flex items-center gap-2 text-primary mb-4">
            <Newspaper className="w-6 h-6" />
            <span className="text-sm font-medium uppercase tracking-wider">{subtitle}</span>
          </div>
          <h2 className={`text-3xl font-bold leading-tight sm:text-4xl sm:leading-tight mb-5 ${
            center ? "text-center" : ""
          }`}>
            {title}
          </h2>
          <p
            className={`text-base text-body-color dark:text-dark-6 ${
              center ? "text-center" : ""
            }`}
            style={{ maxWidth: width }}
          >
            {paragraph}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((blog, idx) => (
            <Card key={idx} className="group border-border/40 bg-card transition-all hover:border-primary/20 hover:shadow-lg">
              <div className="relative overflow-hidden rounded-t-lg">
                <Link href={`/blogs/${blog.slug}`} className="block">
                  <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    width={400}
                    height={300}
                    className="w-full transition duration-300 group-hover:scale-105"
                  />
                </Link>
              </div>
              <CardHeader className="pt-6">
                <div className="mb-4">
                  <span className="inline-block rounded bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                    {format(new Date(blog.date), "dd MMM yyyy")}
                  </span>
                </div>
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="mb-4 block text-xl font-bold text-card-foreground hover:text-primary"
                >
                  {blog.title}
                </Link>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground/80">
                  {blog.excerpt}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;