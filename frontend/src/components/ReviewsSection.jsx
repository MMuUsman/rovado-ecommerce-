import { useState, useEffect } from "react";
import { Star, Trash2, Edit2, User } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

/* ============= Star Selector ============= */
function StarSelector({ value, onChange, size = 24 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition"
        >
          <Star
            size={size}
            fill={(hover || value) >= star ? "currentColor" : "none"}
            className={
              (hover || value) >= star
                ? "text-amber-500"
                : "text-neutral-300 hover:text-amber-400"
            }
          />
        </button>
      ))}
    </div>
  );
}

/* ============= Star Display ============= */
function StarDisplay({ value = 0, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= value ? "currentColor" : "none"}
          className={star <= value ? "text-amber-500" : "text-neutral-300"}
        />
      ))}
    </div>
  );
}

/* ============= Main Reviews Section ============= */
export default function ReviewsSection({ productId }) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState("");
  const [editComment, setEditComment] = useState("");

  /* ============= Load reviews ============= */
  const loadReviews = async () => {
    if (!productId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (!error) setReviews(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  /* ============= Stats ============= */
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  /* ============= Submit new review ============= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("Please login to write a review.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }
    if (comment.trim().length < 5) {
      setError("Comment must be at least 5 characters.");
      return;
    }

    // Check if user already reviewed
    const existing = reviews.find((r) => r.user_id === user.id);
    if (existing) {
      setError("You already reviewed this product. Please edit your existing review.");
      return;
    }

    setSubmitting(true);
    const { error: insertErr } = await supabase.from("reviews").insert({
      product_id: Number(productId),
      user_id: user.id,
      user_name: profile?.full_name || user.email?.split("@")[0] || "User",
      user_email: user.email,
      rating,
      title: title.trim() || null,
      comment: comment.trim(),
    });
    setSubmitting(false);

    if (insertErr) {
      setError(insertErr.message);
      return;
    }

    setSuccess("✓ Review submitted!");
    setRating(5);
    setTitle("");
    setComment("");
    loadReviews();
    setTimeout(() => setSuccess(""), 3000);
  };

  /* ============= Delete review ============= */
  const handleDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }
    loadReviews();
  };

  /* ============= Start edit ============= */
  const startEdit = (review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditTitle(review.title || "");
    setEditComment(review.comment);
  };

  /* ============= Save edit ============= */
  const handleSaveEdit = async () => {
    if (!editComment.trim()) return;
    const { error } = await supabase
      .from("reviews")
      .update({
        rating: editRating,
        title: editTitle.trim() || null,
        comment: editComment.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId);

    if (error) {
      alert("Update failed: " + error.message);
      return;
    }
    setEditingId(null);
    loadReviews();
  };

  const hasReviewed = user && reviews.some((r) => r.user_id === user.id);

  return (
    <div className="space-y-8">
      {/* ============= Summary Header ============= */}
      <div className="grid grid-cols-1 gap-6 rounded-xl bg-gray-50 p-6 sm:grid-cols-[200px_1fr]">
        <div className="text-center sm:text-left">
          <p className="text-5xl font-bold text-black">{avgRating}</p>
          <div className="mt-2 flex justify-center gap-1 sm:justify-start">
            <StarDisplay value={Math.round(Number(avgRating))} size={18} />
          </div>
          <p className="mt-2 text-sm text-stone-500">
            Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-2">
          {ratingCounts.map(({ star, count }) => {
            const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-12 text-right text-stone-500">
                  {star} star
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-10 text-xs text-stone-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============= Write Review Form ============= */}
      {!hasReviewed ? (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold">Write a Review</h3>

          {!user ? (
            <p className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
              Please{" "}
              <a href="/login" className="font-bold underline">
                login
              </a>{" "}
              to write a review.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Your Rating *
                </label>
                <StarSelector value={rating} onChange={setRating} size={28} />
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Excellent product!"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-600"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Your Review *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience with this product..."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-600"
                />
              </div>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-600">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-green-600 px-6 py-3 text-xs font-medium uppercase text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          ✓ You have already reviewed this product. You can edit or delete your
          review below.
        </div>
      )}

      {/* ============= Reviews List ============= */}
      <div>
        <h3 className="mb-4 text-lg font-bold">
          {reviews.length} Customer Review{reviews.length !== 1 ? "s" : ""}
        </h3>

        {loading ? (
          <p className="py-8 text-center text-sm text-stone-500">
            Loading reviews...
          </p>
        ) : reviews.length === 0 ? (
          <p className="rounded-xl bg-gray-50 p-8 text-center text-sm text-stone-500">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const isOwn = user && review.user_id === user.id;
              const isEditing = editingId === review.id;

              return (
                <div
                  key={review.id}
                  className={`rounded-xl border p-5 ${
                    isOwn ? "border-green-200 bg-green-50/30" : "border-stone-200 bg-white"
                  }`}
                >
                  {isEditing ? (
                    /* ======== EDIT MODE ======== */
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-bold">
                          Rating
                        </label>
                        <StarSelector
                          value={editRating}
                          onChange={setEditRating}
                          size={24}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold">
                          Comment
                        </label>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="rounded-lg bg-green-600 px-4 py-2 text-xs font-bold uppercase text-white"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-lg bg-neutral-200 px-4 py-2 text-xs font-bold uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ======== VIEW MODE ======== */
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 place-items-center rounded-full bg-green-100 text-green-600">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">
                              {review.user_name || "User"}
                              {isOwn && (
                                <span className="ml-2 rounded bg-green-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-stone-500">
                              {new Date(review.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        {isOwn && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEdit(review)}
                              className="grid size-8 place-items-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="grid size-8 place-items-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <StarDisplay value={review.rating} size={14} />
                      </div>

                      {review.title && (
                        <p className="mt-2 text-sm font-bold">{review.title}</p>
                      )}
                      <p className="mt-1 text-sm text-stone-700 whitespace-pre-line">
                        {review.comment}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}