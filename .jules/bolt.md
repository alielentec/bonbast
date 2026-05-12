## 2025-05-12 - Intl caching for performance
**Learning:** Reusing Intl.NumberFormat and Intl.DateTimeFormat instances is significantly faster (~80x in Node.js) than re-creating them on every call. This is particularly important for functions called frequently, such as those used in table rendering or high-frequency updates (like the simulation demo in this app).
**Action:** Always reuse or cache Intl formatter instances when they are used in a loop or a frequently re-rendered component.
