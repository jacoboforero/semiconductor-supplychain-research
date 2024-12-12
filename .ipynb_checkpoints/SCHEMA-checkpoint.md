# Description

This schema will describe a directed graph database which aims to capture the relationships between different entities in the semi-conductor industry. Partnerships will not be directed.

## Node Types

1. Company
2. Individual
3. Country

### Company Node Attributes

- name(string): Official company name
- lei(string): LEI code if available, for global identification.
- location(string): Country or region where the company is headquartered.
- type (string): E.g., “Manufacturer,” “Foundry,” “Designer,” “Supplier,” “Distributor.”
- criticality_score (float): A custom metric based on how important it is in the supply chain

### Individual Node Attributes

- name(string): legal name of the individual
- country-one(string): Country individual is primarily allied to
- country-one(string): Secondary country affiliation

### Country Node Attributes

- name(string): official country name
- global alliance(string): NATO, CTSO, or other

## Edge Types

- SUPPLIES_TO (Company → Company): Indicates that one company supplies components or materials to another.
- OWNS (Company → Company): For ownership or subsidiary relationships.
- DISTRIBUTES_FOR (Company → Company): A distributor relationship, if distinct from supplies.
- PARTNERS_WITH (Company ↔ Company): For joint ventures or R&D collaborations

### Edge Attributes

- weight (float): Indicates importance or volume of trade/interaction (e.g., percentage of a critical component’s supply).
- start_date (date): When the relationship began.
- end_date (date or null): If it ended or is ongoing.
- reliability_score (float): A custom metric indicating how reliable the relationship has been historically.
