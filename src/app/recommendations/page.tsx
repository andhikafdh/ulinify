"use client";

import { BusFront, Plus, Leaf } from "lucide-react";
import { motion } from "framer-motion";

const challenges = [
	{
		title: "Gunakan Transportasi Umum",
		description: "Naik Transportasi Umum setiap hari minimal 1 kali",
		hp: "20 HP",
		co2: "-20g Co2",
	},
	{
		title: "Gunakan Transportasi Umum",
		description: "Naik Transportasi Umum setiap hari minimal 1 kali",
		hp: "20 HP",
		co2: "-20g Co2",
	},
	{
		title: "Gunakan Transportasi Umum",
		description: "Naik Transportasi Umum setiap hari minimal 1 kali",
		hp: "20 HP",
		co2: "-20g Co2",
	},
	{
		title: "Gunakan Transportasi Umum",
		description: "Naik Transportasi Umum setiap hari minimal 1 kali",
		hp: "20 HP",
		co2: "-20g Co2",
	},
];

export default function ChallengeRecommendationsPage() {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.15,
				delayChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				stiffness: 100,
				damping: 12,
			},
		},
	};

	return (
		<main className="min-h-screen flex items-center justify-center bg-[#001E31] px-4">
			<motion.div
				className="w-full max-w-xs flex flex-col gap-6 py-10"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				<motion.h1
					className="text-center text-2xl font-semibold text-[#E9F5FF] leading-snug"
					variants={itemVariants}
				>
					Ini rekomendasi tantangan
					<br />
					untukmu
				</motion.h1>

				<div className="flex flex-col gap-4">
					{challenges.map((item, idx) => (
						<motion.div
							key={idx}
							variants={itemVariants}
							whileHover={{
								scale: 1.03,
								boxShadow: "0 10px 30px rgba(0, 255, 161, 0.2)",
								borderColor: "rgba(0, 255, 161, 0.6)",
							}}
							whileTap={{ scale: 0.98 }}
							transition={{ type: "spring", stiffness: 300, damping: 20 }}
							className="w-full rounded-2xl border border-[#C7E2FF]/40 bg-[#02253A] px-4 py-3 flex flex-col gap-3 cursor-pointer"
						>
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 flex items-center justify-center">
									<BusFront className="text-[#E9F5FF]" size={50} />
								</div>
								<div className="flex flex-1 flex-col gap-2">
									<p className="text-base font-semibold text-[#E9F5FF]">
										{item.title}
									</p>

									<p className="text-sm text-[#E9F5FF]">
										{item.description}
									</p>

									<div className="flex items-center gap-2">
										<div className="inline-flex items-center gap-1 rounded-full bg-[#FF00BF] px-3 py-1 text-sm font-semibold text-[#FFF8DD]">
											<Plus size={12} />
											{item.hp}
										</div>
										<div className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-[#00FFA1]">
											<Leaf size={12} />
											{item.co2}
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</div>

				<motion.button
					variants={itemVariants}
					whileHover={{
						scale: 1.05,
						boxShadow: "0 10px 30px rgba(255, 0, 191, 0.3)",
					}}
					whileTap={{ scale: 0.98 }}
					className="mt-4 w-full rounded-xl bg-[#FF00BF] py-3 text-center text-sm font-semibold text-[#FFF8DD] shadow-md transition"
				>
					Lanjut
				</motion.button>
			</motion.div>
		</main>
	);
}
