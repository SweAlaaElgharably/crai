import Image from "next/image";
import auth from "@/assets/images/auth.png";

export default function AuthHero() {
    return(
        <div className="w-full flex justify-center items-center bg-primary">
            <Image className="" src={auth} alt="hero" priority></Image>
        </div>
    );
}