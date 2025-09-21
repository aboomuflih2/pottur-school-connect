import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { djangoAPI } from '@/lib/django-api';

interface PageContent {
  content: string;
}

const LegacySection = () => {
    const { data, isLoading } = useQuery<PageContent, Error>({
        queryKey: ['pageContent', 'about_legacy'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getPageContent();
            // @ts-ignore
            const legacyContent = response.results.find(item => item.page_name === 'about_legacy');
            return legacyContent || { content: '' };
        },
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Our Legacy</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        {data?.content}
                    </p>
                    <div className="mt-8">
                        <Link to="/about">
                            <Button>Learn More About Us</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LegacySection;
