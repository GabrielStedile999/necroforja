import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UploadImageForm } from "@/components/admin/UploadImageForm";
import { listPostsAdmin } from "@/lib/db/queries";
import { formatPostDate } from "@/lib/blog";
import { POST_TYPES, toPostType } from "@/components/blog/postTypes";
import { deletePost } from "./actions";
import { Newspaper } from "lucide-react";

export const metadata: Metadata = {
	title: "Journal Admin",
	robots: { index: false, follow: false },
};

// Área administrativa — sempre dados frescos.
export const dynamic = "force-dynamic";

/** Painel do jornal de campanha (issue #5): lista, upload e atalhos. */
export default async function AdminBlogPage() {
	const posts = await listPostsAdmin();

	return (
		<>
			<SiteHeader />
			<main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
				<div className="flex items-center gap-3">
					<Newspaper className="h-6 w-6 text-hazard" aria-hidden />
					<h1 className="stencil text-2xl font-bold text-ink">Campaign Journal</h1>
					<Badge variant="hazard">Admin</Badge>
					<div className="ml-auto flex gap-2">
						<Link href="/admin">
							<Button variant="ghost">← Arbitrator</Button>
						</Link>
						<Link href="/admin/blog/new">
							<Button>New post</Button>
						</Link>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Image upload (Supabase Storage)</CardTitle>
						<span className="ml-auto text-xs text-muted">bucket: blog</span>
					</CardHeader>
					<CardContent>
						<UploadImageForm />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Posts ({posts.length})</CardTitle>
					</CardHeader>
					<CardContent className="px-0 py-0">
						{posts.length === 0 ? (
							<p className="px-5 py-6 text-sm text-muted">
								No posts yet. Create the first one — or run <code>npm run db:seed:blog</code>{" "}
								to seed the week 1 mission report.
							</p>
						) : (
							<ul className="divide-y divide-rivet/50">
								{posts.map((post) => {
									const meta = POST_TYPES[toPostType(post.type)];
									return (
										<li
											key={post.id}
											className="flex items-center justify-between gap-3 px-5 py-3"
										>
											<div className="min-w-0">
												<div className="truncate font-display text-base font-semibold uppercase text-ink">
													{post.titleEn}
												</div>
												<div className="text-xs text-muted">
													<span style={{ color: meta.color }}>{meta.labels.en}</span>
													{" · "}
													{post.slug}
													{" · "}
													{formatPostDate(post.publishedAt ?? post.createdAt)}
												</div>
											</div>
											<div className="flex shrink-0 items-center gap-3">
												<Badge variant={post.published ? "toxic" : "muted"}>
													{post.published ? "published" : "draft"}
												</Badge>
												{post.published && (
													<a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
														<Button variant="ghost" type="button" className="text-xs">
															View
														</Button>
													</a>
												)}
												<Link href={`/admin/blog/${post.id}`}>
													<Button variant="outline" type="button">
														Edit
													</Button>
												</Link>
												<form action={deletePost}>
													<input type="hidden" name="postId" value={post.id} />
													<Button variant="ghost" type="submit" className="text-xs text-blood">
														Delete
													</Button>
												</form>
											</div>
										</li>
									);
								})}
							</ul>
						)}
					</CardContent>
				</Card>
			</main>
		</>
	);
}
