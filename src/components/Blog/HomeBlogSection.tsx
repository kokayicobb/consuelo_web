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
  subtitle = "Our Blog",
  title = "Latest Updates",
  paragraph = "Discover how Consuelo is Building a Modern Shopping Experience with our curated selections, user-friendly design, and commitment to making fashion accessible to all.",
  width = "640px",
  center = true,
  posts
}: BlogSectionProps) => {
  return (
    <section className="bg-background pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Themed pill */}
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium">
              <Newspaper className="mr-2 h-4 w-4 text-accent" />
              <span className="text-accent">{subtitle}</span>
            </div>
          </div>

          {/* Themed title */}
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Latest{" "}
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Updates
            </span>
          </h2>

          {/* Themed paragraph */}
          <p className="mt-4 text-lg text-muted-foreground mx-auto" style={{ maxWidth: width }}>
            {paragraph}
          </p>
        </div>

        {/* Blog grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((blog, idx) => (
            <Card 
              key={idx} 
              className="group overflow-hidden border-border/40 bg-card transition-all hover:border-accent/20 hover:shadow-lg"
            >
              <div className="relative overflow-hidden">
                <Link href={`/blogs/${blog.slug}`} className="block">
                  <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    width={400}
                    height={300}
                    className="w-full h-[200px] object-cover transition duration-300 group-hover:scale-105"
                  />
                </Link>
              </div>
              
              <CardHeader className="pt-6">
                <div className="mb-4">
                  <span className="inline-block rounded-full bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
                    {format(new Date(blog.date), "dd MMM yyyy")}
                  </span>
                </div>
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="mb-4 block text-xl font-bold text-foreground hover:text-accent transition-colors"
                >
                  {blog.title}
                </Link>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground">
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