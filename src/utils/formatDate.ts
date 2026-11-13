export const formatDate = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeZone: "Asia/Tokyo",
      }).format(new Date(iso))
    : "";
