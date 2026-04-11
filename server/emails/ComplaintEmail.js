import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Img,
} from "@react-email/components";

const h = React.createElement;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  border: "1px solid #e6ebf1",
};

const heading = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#1a1a2e",
  textAlign: "center",
  padding: "0 48px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#484848",
  padding: "0 48px",
};

const label = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#8898aa",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  margin: "0",
  padding: "0 48px",
};

const value = {
  fontSize: "16px",
  color: "#1a1a2e",
  margin: "4px 0 16px",
  padding: "0 48px",
};

const statusBadge = (status) => {
  const colors = {
    Pending: { bg: "#fff3cd", text: "#856404", border: "#ffc107" },
    "In Progress": { bg: "#cce5ff", text: "#004085", border: "#007bff" },
    Resolved: { bg: "#d4edda", text: "#155724", border: "#28a745" },
    Assigned: { bg: "#e2e3f1", text: "#383d6e", border: "#6c63ff" },
  };
  const c = colors[status] || colors.Pending;
  return {
    display: "inline-block",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: c.bg,
    color: c.text,
    border: `1px solid ${c.border}`,
    marginLeft: "48px",
  };
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 48px",
};

const footer = {
  fontSize: "13px",
  color: "#8898aa",
  textAlign: "center",
  padding: "0 48px",
};

const imageStyle = {
  borderRadius: "8px",
  margin: "0 48px",
  maxWidth: "calc(100% - 96px)",
};

/**
 * Build a React element tree for complaint notification emails.
 *
 * @param {object} opts
 * @param {string} opts.message  – e.g. "Your complaint has been received"
 * @param {string} opts.ticketId
 * @param {string} opts.title
 * @param {string} opts.status
 * @param {string} [opts.category]
 * @param {string} [opts.location]
 * @param {string} [opts.description]
 * @param {string} [opts.imageUrl]
 * @returns React element
 */
export function ComplaintEmail({
  message,
  ticketId,
  title,
  status,
  category,
  location,
  description,
  imageUrl,
}) {
  return h(
    Html,
    null,
    h(Head),
    h(Preview, null, `${message} — ${ticketId}`),
    h(
      Body,
      { style: main },
      h(
        Container,
        { style: container },

        // Header
        h(Heading, { style: heading }, "FixMyCampus"),
        h(Hr, { style: hr }),

        // Message
        h(Text, { style: { ...paragraph, fontSize: "18px", fontWeight: "600" } }, message),

        // Ticket ID
        h(Text, { style: label }, "Ticket ID"),
        h(Text, { style: value }, ticketId || "—"),

        // Title
        h(Text, { style: label }, "Complaint"),
        h(Text, { style: value }, title || "—"),

        // Status badge
        h(Text, { style: label }, "Status"),
        h(Text, { style: statusBadge(status) }, status || "Pending"),

        // Category
        category
          ? h(
              React.Fragment,
              null,
              h(Text, { style: { ...label, marginTop: "16px" } }, "Category"),
              h(Text, { style: value }, category)
            )
          : null,

        // Location
        location
          ? h(
              React.Fragment,
              null,
              h(Text, { style: label }, "Location"),
              h(Text, { style: value }, location)
            )
          : null,

        // Description
        description
          ? h(
              React.Fragment,
              null,
              h(Text, { style: label }, "Description"),
              h(Text, { style: { ...value, color: "#666" } }, description)
            )
          : null,

        // Image
        imageUrl
          ? h(
              React.Fragment,
              null,
              h(Hr, { style: hr }),
              h(Img, { src: imageUrl, alt: "Issue image", style: imageStyle, width: 400 })
            )
          : null,

        // Footer
        h(Hr, { style: hr }),
        h(
          Text,
          { style: footer },
          "This is an automated notification from FixMyCampus. Do not reply to this email."
        )
      )
    )
  );
}
