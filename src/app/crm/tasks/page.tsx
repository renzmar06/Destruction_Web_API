"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Search,
	Plus,
	CheckCircle2,
	Calendar,
	User,
	Phone,
	Mail,
	MessageCircle,
	FileText,
	Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

const typeIcons = {
	call: Phone,
	email: Mail,
	meeting: Users,
	task: CheckCircle2,
	note: FileText,
	follow_up: MessageCircle,
};

const typeColors = {
	call: "bg-blue-100 text-blue-700",
	email: "bg-purple-100 text-purple-700",
	meeting: "bg-green-100 text-green-700",
	task: "bg-orange-100 text-orange-700",
	note: "bg-slate-100 text-slate-700",
	follow_up: "bg-pink-100 text-pink-700",
};
interface DateRangePickerProps {
	value?: DateRange;
	onChange?: (range: DateRange | undefined) => void;
	className?: string;
	placeholder?: string;
}

export default function Tasks() {
	const [searchQuery, setSearchQuery] = useState("");
	const [filter, setFilter] = useState("all");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [tasks, setTasks] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [newTask, setNewTask] = useState({
		type: "task",
		title: "",
		description: "",
		customer_id: "",
		due_date_from: "",
		due_date_to: "",
		due_date_range: undefined as DateRange | undefined,
	});

	useEffect(() => {
		fetchTasks();
		fetchCustomers();
	}, []);

	const fetchTasks = async () => {
		try {
			const res = await fetch("/api/crm-tasks");
			const result = await res.json();
			if (result.success) {
				setTasks(result.data);
			}
		} catch (error) {
			console.error("Error fetching tasks:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchCustomers = async () => {
		try {
			const res = await fetch("/api/customers");
			const result = await res.json();
			if (result.success) {
				setCustomers(result.data);
			}
		} catch (error) {
			console.error("Error fetching customers:", error);
		}
	};

	const createTask = async (data: any) => {
		try {
			const res = await fetch("/api/crm-tasks", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			const result = await res.json();
			if (result.success) {
				fetchTasks();
				setIsCreateOpen(false);
				setNewTask({
					type: "task",
					title: "",
					description: "",
					customer_id: "",
					due_date_from: "",
					due_date_to: "",
					due_date_range: undefined,
				});
			}
		} catch (error) {
			console.error("Error creating task:", error);
		}
	};

	const updateTask = async (id: string, data: any) => {
		try {
			const res = await fetch(`/api/crm-tasks/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			const result = await res.json();
			if (result.success) {
				fetchTasks();
			}
		} catch (error) {
			console.error("Error updating task:", error);
		}
	};

	const handleToggleComplete = (task: any) => {
		updateTask(task._id, {
			completed: !task.completed,
			completed_at: !task.completed ? new Date().toISOString() : null,
		});
	};

	const handleCreate = () => {
		if (!newTask.title.trim()) return;
		const taskData: any = {
			...newTask,
			completed: false,
			due_date_from: newTask.due_date_range?.from?.toISOString() || "",
			due_date_to: newTask.due_date_range?.to?.toISOString() || "",
		};
		delete taskData.due_date_range;
		createTask(taskData);
	};

	const filteredTasks = tasks.filter((task: any) => {
		const matchesSearch =
			!searchQuery ||
			task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			task.description?.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesFilter =
			filter === "all" ||
			(filter === "pending" && !task.completed) ||
			(filter === "completed" && task.completed) ||
			(filter === "overdue" &&
				!task.completed &&
				task.due_date &&
				new Date(task.due_date) < new Date());

		return matchesSearch && matchesFilter;
	});

	const stats = {
		total: tasks.length,
		pending: tasks.filter((t: any) => !t.completed).length,
		completed: tasks.filter((t: any) => t.completed).length,
		overdue: tasks.filter(
			(t: any) =>
				!t.completed && t.due_date && new Date(t.due_date) < new Date(),
		).length,
	};

	return (
		<div className="p-6 bg-slate-50 min-h-screen">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">
						Tasks & Activities
					</h1>
					<p className="text-slate-500">Manage your tasks and activities</p>
				</div>
				<Button
					onClick={() => setIsCreateOpen(true)}
					className="bg-blue-500 hover:bg-blue-600"
				>
					<Plus className="w-4 h-4 mr-2" />
					Create Task
				</Button>
			</div>

			<div className="grid grid-cols-4 gap-4 mb-6">
				<div className="bg-white rounded-xl p-4 border border-slate-100">
					<p className="text-sm text-slate-500">Total Tasks</p>
					<p className="text-2xl font-bold text-slate-900">{stats.total}</p>
				</div>
				<div className="bg-white rounded-xl p-4 border border-slate-100">
					<p className="text-sm text-slate-500">Pending</p>
					<p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
				</div>
				<div className="bg-white rounded-xl p-4 border border-slate-100">
					<p className="text-sm text-slate-500">Completed</p>
					<p className="text-2xl font-bold text-green-600">{stats.completed}</p>
				</div>
				<div className="bg-white rounded-xl p-4 border border-slate-100">
					<p className="text-sm text-slate-500">Overdue</p>
					<p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
				</div>
			</div>

			<div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
				<div className="p-4 border-b flex items-center gap-4">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
						<Input
							placeholder="Search tasks..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Tabs value={filter} onValueChange={setFilter}>
						<TabsList className="bg-slate-100">
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="pending">Pending</TabsTrigger>
							<TabsTrigger value="completed">Completed</TabsTrigger>
							<TabsTrigger value="overdue">Overdue</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>

				<div className="divide-y">
					{filteredTasks.length === 0 ? (
						<div className="text-center py-12 text-slate-400">
							<CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
							<p>No tasks found</p>
						</div>
					) : (
						filteredTasks.map((task: any) => {
							const customer: any = customers.find(
								(c: any) => c._id === task.customer_id,
							);
							const TypeIcon = typeIcons[task.type as keyof typeof typeIcons] || CheckCircle2;
							const isOverdue =
								!task.completed &&
								task.due_date &&
								new Date(task.due_date) < new Date();

							return (
								<div
									key={task._id}
									className="p-4 hover:bg-slate-50 transition-colors"
								>
									<div className="flex items-start gap-4">
										<Checkbox
											checked={task.completed}
											onCheckedChange={() => handleToggleComplete(task)}
											className="mt-1"
										/>
										<div className="flex-1">
											<div className="flex items-start justify-between mb-1">
												<h3
													className={cn(
														"font-medium",
														task.completed && "line-through text-slate-500",
													)}
												>
													{task.title}
												</h3>
												<Badge
													className={cn("capitalize", typeColors[task.type as keyof typeof typeColors])}
												>
													<TypeIcon className="w-3 h-3 mr-1" />
													{task.type}
												</Badge>
											</div>
											{task.description && (
												<p className="text-sm text-slate-500 mb-2">
													{task.description}
												</p>
											)}
											<div className="flex items-center gap-4 text-sm text-slate-500">
												{customer && (
													<div className="flex items-center gap-1">
														<User className="w-3 h-3" />
														{customer.name}
													</div>
												)}
												{task.due_date_to && (
													<div
														className={cn(
															"flex items-center gap-1",
															isOverdue && "text-red-600 font-medium",
														)}
													>
														<Calendar className="w-3 h-3" />
														{format(new Date(task.due_date_from), "MMM d, yyyy")} – {format(new Date(task.due_date_to), "MMM d, yyyy")}
														{isOverdue && " (Overdue)"}
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Task</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 mt-4">
						<div>
							<Label>Type</Label>
							<Select
								value={newTask.type}
								onValueChange={(v) => setNewTask({ ...newTask, type: v })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="task">Task</SelectItem>
									<SelectItem value="call">Call</SelectItem>
									<SelectItem value="email">Email</SelectItem>
									<SelectItem value="meeting">Meeting</SelectItem>
									<SelectItem value="follow_up">Follow Up</SelectItem>
									<SelectItem value="note">Note</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Title *</Label>
							<Input
								value={newTask.title}
								onChange={(e) =>
									setNewTask({ ...newTask, title: e.target.value })
								}
								placeholder="Task title"
							/>
						</div>
						<div>
							<Label>Description</Label>
							<Textarea
								value={newTask.description}
								onChange={(e) =>
									setNewTask({ ...newTask, description: e.target.value })
								}
								placeholder="Task description..."
								rows={3}
							/>
						</div>
						<div>
							<Label>Customer</Label>
							<Select
								value={newTask.customer_id}
								onValueChange={(v) =>
									setNewTask({ ...newTask, customer_id: v })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select customer" />
								</SelectTrigger>
								<SelectContent>
									{customers.map((c: any) => (
										<SelectItem key={c._id} value={c._id}>
											{c.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Due Date Range</Label>
							<DateRangePicker
								value={newTask.due_date_range}
								onChange={(range) =>
									setNewTask({
										...newTask,
										due_date_range: range,
									})
								}
							/>
						</div>
						<div className="flex justify-end gap-3 pt-4">
							<Button variant="outline" onClick={() => setIsCreateOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleCreate} disabled={!newTask.title.trim()}>
								Create Task
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
