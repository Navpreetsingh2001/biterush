
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Users } from 'lucide-react';

const AboutPage: FC = () => {
  // Updated university name
  const universityName = "Lovely Professional University";
  // Updated creators list (removed Lokesh)
  const creators = [
    { name: "Naaz", avatarUrl: "https://picsum.photos/seed/naaz/100/100" },
    { name: "Rajnikanth", avatarUrl: "https://picsum.photos/seed/rajnikanth/100/100" },
    { name: "Yogesh", avatarUrl: "https://picsum.photos/seed/yogesh/100/100" },
    { name: "Navpreet", avatarUrl: "https://picsum.photos/seed/navpreet/100/100" },
    // Add more creators if needed
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">About Biterush</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* University Info Card */}
        <Card>
          <CardHeader>
            {/* Changed title from "About {universityName}" to just "About" */}
            <CardTitle className="flex items-center gap-2">
              <Building className="h-6 w-6 text-secondary-foreground" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {universityName} is committed to providing excellent facilities and services to its students. Biterush is a project aimed at enhancing the campus dining experience by offering a convenient way to order food from various food courts within the university.
            </p>
            <p className="text-muted-foreground">
              This application allows students and staff to browse menus, place orders, and pay seamlessly, reducing wait times and improving accessibility to campus food options.
            </p>
            {/* Add more relevant university info here */}
          </CardContent>
        </Card>

        {/* Creators Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-secondary-foreground" />
              Meet the Creators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Biterush was developed by talented and dedicated students from {universityName} as part of a project initiative.
            </p>
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              {creators.map((creator, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={creator.avatarUrl} alt={creator.name} />
                    {/* Generate fallback from the first two letters if available, else first letter */}
                    <AvatarFallback>{creator.name.length > 1 ? creator.name.substring(0, 2).toUpperCase() : creator.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{creator.name}</p>
                </div>
              ))}
            </div>
            {/* Add more details about the project or creators if needed */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
