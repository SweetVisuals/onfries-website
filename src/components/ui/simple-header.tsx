import React from 'react';
import { Grid2x2PlusIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { MenuToggle } from '@/components/ui/menu-toggle';

export function SimpleHeader() {
	const [open, setOpen] = React.useState(false);

	const links = [
		{
			label: 'Menu',
			href: '#menu',
		},
	];

	return (
		<header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-lg">
			<nav className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<Grid2x2PlusIcon className="size-6" />
					<p className="font-mono text-lg font-bold">Foodie</p>
				</div>
				<div className="hidden items-center gap-2 lg:flex">
					{links.map((link) => (
						<a
							key={link.href}
							className={buttonVariants({ variant: 'ghost' })}
							href={link.href}
						>
							{link.label}
						</a>
					))}
					<Button variant="outline">Sign In</Button>
				</div>
				<Sheet open={open} onOpenChange={setOpen}>
					<Button size="icon" variant="outline" className="lg:hidden">
						<MenuToggle
							strokeWidth={2.5}
							open={open}
							onOpenChange={setOpen}
							className="size-6"
						/>
					</Button>
					<SheetContent
						className="bg-background/95 supports-[backdrop-filter]:bg-background/80 gap-0 backdrop-blur-lg"
						showClose={false}
						side="left"
					>
						<div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
							{links.map((link) => (
								<a
									key={link.href}
									className={buttonVariants({
										variant: 'ghost',
										className: 'justify-start',
									})}
									href={link.href}
								>
									{link.label}
								</a>
							))}
						</div>
						<SheetFooter>
							<Button variant="outline">Sign In</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			</nav>
		</header>
	);
}