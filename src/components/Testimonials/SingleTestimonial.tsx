import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarIcon } from 'lucide-react'

interface Testimonial {
  star: number
  name: string
  image: string
  content: string
  designation: string
}

export function SingleTestimonial({ testimonial }: { testimonial: Testimonial }) {
  const { star, name, image, content, designation } = testimonial

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardContent className="pt-6">
        <div className="flex mb-4">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`h-5 w-5 ${
                i < star ? "text-accent fill-accent" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-base text-text/80 italic">"{content}"</p>
      </CardContent>
      <CardFooter>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={image} alt={name} />
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-text">{name}</p>
            <p className="text-xs text-text/70">{designation}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default SingleTestimonial

