# Tasks

This directory is the lightweight task-tracking system for the project.

It is designed to work well for:

- a PM-style view of what is happening
- agent-driven execution
- durable repo history

Use this instead of scattering task state across chat history.

## Structure

- `INDEX.md`: the current task board
- `backlog/`: approved but not started tasks
- `active/`: tasks currently in progress or next up
- `completed/`: finished tasks kept for history
- `templates/`: task templates

## Rules

- One meaningful task per file.
- Use stable task IDs like `TASK-001`.
- Keep titles short and action-oriented.
- Update `INDEX.md` whenever a task changes status.
- Link a task to an execution plan in `docs/exec-plans/` when the task is large enough to need one.
- Move task files between `backlog/`, `active/`, and `completed/` as status changes.

## Status Model

Use one of:

- `backlog`
- `in_progress`
- `blocked`
- `done`

## When To Create A Task

Create a task when work is:

- meaningful enough to deserve durable tracking
- likely to span multiple edits or turns
- important enough that you want a clear done state

Do not create tasks for trivial one-off wording edits or tiny housekeeping changes unless they matter to the project plan.
