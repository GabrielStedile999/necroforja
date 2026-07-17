import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostForm } from "@/components/admin/PostForm";
import { getPostById } from "@/lib/db/queries";

export const metadata: Metadata = {
	title: "Edit Post",
	robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Edição de post do jornal (issue #5). */
export default async function EditPostPage({
	params,
}: {
	params: Promise<{ postId: string }>;
}) {
	const { postId } = await params;
	const post = await getPostById(postId);
	if (!post) notFound();

	return (
		<>
			<SiteHeader />
			<main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
				<div className="flex items-center gap-3">
					<h1 className="stencil text-2xl font-bold text-ink">Edit post</h1>
					<Link href="/admin/reports" className="ml-auto">
						<Button variant="ghost">← Journal</Button>
					</Link>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>{post.titleEn}</CardTitle>
						<span className="ml-auto text-xs text-muted">{post.slug}</span>
					</CardHeader>
					<CardContent>
						<PostForm
							post={{
								id: post.id,
								slug: post.slug,
								type: post.type,
								titleEn: post.titleEn,
								titlePt: post.titlePt,
								excerptEn: post.excerptEn,
								excerptPt: post.excerptPt,
								bodyEn: post.bodyEn,
								bodyPt: post.bodyPt,
								coverImage: post.coverImage ?? "",
								coverAlt: post.coverAlt ?? "",
								published: post.published,
							}}
						/>
					</CardContent>
				</Card>
			</main>
		</>
	);
}
