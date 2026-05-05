if (process.env.NODE_ENV === "production") {
  console.error("ERROR: seed must not run in production");
  process.exit(1);
}
