# Backend Architecture

> Scope: `apps/server/` only. Modular Spring architecture with explicit boundaries.

## 1. Layer responsibilities are fixed

| Layer | May do | Must not do |
|---|---|---|
| Controller | Map HTTP requests, validate input, call one service method, return response DTOs. | Contain business rules or query repositories directly. |
| Service | Own business logic, authorization, transactions, and orchestration. | Depend on controllers or another module's repository implementation. |
| Repository | Persist aggregates owned by the module. | Reach across another module's tables as a shortcut. |
| Adapter | Wrap an external system behind a module-owned port interface. | Contain business rules. |

## 2. Depend on interfaces at module boundaries

When a module needs behavior from another module or an external system, depend on a narrow Java interface and inject its implementation through Spring. Consumers import the interface, not the concrete class.

## 3. Cross-module data flows through the owning module

A repository may only query data owned by its own module. Reads or writes that cross module boundaries go through the owning module's public service or port.

## 4. Keep modules acyclic

Circular dependencies between modules are forbidden. If two modules need each other, the design is missing a third concept or a better boundary.

## 5. Authorization belongs in services

Controllers pass the authenticated actor to services. Services decide whether the actor may perform the operation and fail with a domain-level authorization error when they may not.
