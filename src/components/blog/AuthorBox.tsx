import Image from 'next/image';

interface AuthorBoxProps {
  name: string;
  role: string;
  image?: string;
}

export function AuthorBox({ name, role, image }: AuthorBoxProps) {
  return (
    <div className="flex items-center gap-4 py-6 border-t border-b border-gray-100 my-8">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
        {image ? (
          <Image src={image} alt={name} width={56} height={56} className="object-cover" />
        ) : (
          <span className="text-xl font-bold text-primary">
            {name.charAt(0)}
          </span>
        )}
      </div>
      <div>
        <div className="font-semibold text-gray-900">{name}</div>
        <div className="text-sm text-gray-500">{role}</div>
      </div>
    </div>
  );
}
