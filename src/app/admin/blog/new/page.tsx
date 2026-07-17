import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostForm } from "@/components/admin/PostForm";

export const metadata: Metadata = {
	title: "New Post",
	robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Criação de post do jornal (issue #5). */
export default function NewPostPage() {
	return (
		<>
			<SiteHeader />
			<main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
				<div className="flex items-center gap-3">
					<h1 className="stencil text-2xl font-bold text-ink">New post</h1>
					<Link href="/admin/blog" className="ml-auto">
						<Button variant="ghost">← Journal</Button>
					</Link>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Post editor</CardTitle>
						<span className="ml-auto text-xs text-muted">Markdown · EN + PT-BR</span>
					</CardHeader>
					<CardContent>
						<PostForm />
					</CardContent>
				</Card>
			</main>
		</>
	);
}
