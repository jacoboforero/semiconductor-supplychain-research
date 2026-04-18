# semisupply

This package is the durable data-pipeline foundation for the project.

The intended workflow order is:

1. `registry`
2. `taxonomy`
3. `sources`
4. `normalize`
5. `claims`
6. `graph`
7. `runs`
8. `analysis`

Do not add broad `utils/` or `services/` directories as the default escape hatch.

New modules should map to real workflow responsibilities.
