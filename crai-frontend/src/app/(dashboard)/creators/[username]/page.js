import InfluencerProfile from "@/components/influencerprofile";

export default async function InfluencerPage({ params }) {
    const { username } = await params;
    return (
        <InfluencerProfile username={username} />
    );
}