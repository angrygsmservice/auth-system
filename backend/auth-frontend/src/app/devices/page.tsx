"use client";

import { useEffect, useState } from "react";
import API from "../../lib/api";
import AuthGuard from "@/components/AuthGuard";

export default function DevicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);

  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [durationMax, setDurationMax] = useState("");
  const [durationUnit, setDurationUnit] = useState("minutes");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null
  );

  const [sessions, setSessions] = useState<any[]>([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [showServiceEditModal, setShowServiceEditModal] = useState(false);

  const [orderFields, setOrderFields] = useState<any[]>([]);
  const [createOrderFields, setCreateOrderFields] = useState<any[]>([]);

  const [lockPictures, setLockPictures] = useState<string[]>([]);
  const [newLockPicture, setNewLockPicture] = useState("");

  const [newField, setNewField] = useState({
    name: "",
    label: "",
    type: "text",
    required: false,
    placeholder: "",
  });

  const [selectedCategoryForEdit, setSelectedCategoryForEdit] =
    useState<any | null>(null);

  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);

  useEffect(() => {
    console.log("DEVICES PAGE OPENED");
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchCategories();
    fetchServices();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      console.log("TOKEN:", token);

      const res = await API.get("/auth/login-history");

      console.log("RESPONSE:", res.data);

      setSessions(res.data.data);
    } catch (err: any) {
      console.log("ERROR:", err.response?.status);
      console.log(err.response?.data);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");

      console.log("CATEGORIES:", res.data);

      setCategories(res.data.data);
    } catch (err: any) {
      console.log("GET CATEGORIES ERROR:", err.response?.data);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await API.get("/services");

      console.log("SERVICES:", res.data);

      setServices(res.data.data);
    } catch (err: any) {
      console.log("GET SERVICES ERROR:", err.response?.data);
    }
  };

  const handleLogoutDevice = async (sessionId: string) => {
    try {
      await API.delete(`/auth/logout-device/${sessionId}`);

      setSessions((prev) =>
        prev.filter((item) => item._id !== sessionId)
      );
    } catch (err) {
      console.log(err);
      alert("Device logout failed");
    }
  };

  const handleLogoutOtherDevices = async () => {
    try {
      await API.delete("/auth/logout-other-devices");

      fetchSessions();

      alert("Other devices logged out successfully");
    } catch (err) {
      console.log(err);
      alert("Failed to logout other devices");
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-950 p-6 text-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Device Management
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage your services and connected devices
          </p>
        </div>

        {/* Services */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Services
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Manage available services
              </p>
            </div>

            <input
              type="text"
              placeholder="Search services..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="w-64 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />

            <button
              onClick={() => setShowCategoryModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + Add Category
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category._id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      Manage services in this category
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        category.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {category.status === "active"
                        ? "Active"
                        : "Inactive"}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedCategoryForEdit(category);
                        setShowCategoryEditModal(true);
                      }}
                      className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition hover:bg-gray-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={async () => {
                        const confirmed = window.confirm(
                          `Delete "${category.name}" category?`
                        );

                        if (!confirmed) return;

                        try {
                          await API.delete(
                            `/categories/${category._id}`
                          );

                          setCategories((prev) =>
                            prev.filter(
                              (item) =>
                                item._id !== category._id
                            )
                          );
                        } catch (error: any) {
                          console.log(
                            "DELETE CATEGORY ERROR:",
                            error.response?.data
                          );

                          alert(
                            error.response?.data?.message ||
                              "Category o‘chirishda xatolik"
                          );
                        }
                      }}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setShowServiceModal(true);
                      }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      + Add Service
                    </button>
                  </div>
                </div>

                {/* Services in this category */}
                <div className="mt-5 space-y-3 border-t border-gray-800 pt-5">
                  {services
                    .filter(
                      (service) =>
                        service.category === category.name
                    )
                    .filter((service) => {
                      const search =
                        serviceSearch.toLowerCase().trim();

                      if (!search) return true;

                      return service.name
                        ?.toLowerCase()
                        .includes(search);
                    })
                    .map((service) => (
                      <div
                        key={service._id}
                        className="rounded-lg border border-gray-700 bg-gray-950 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h5 className="font-semibold text-white">
                                {service.name}
                              </h5>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  service.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {service.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>

                            {service.description && (
                              <p className="mt-1 text-sm text-gray-400">
                                {service.description}
                              </p>
                            )}

                            <div className="mt-3 flex items-center gap-4 text-sm">
                              <span className="font-semibold text-green-400">
                                ${service.price ?? 0}
                              </span>

                              <span className="text-gray-400">
                                {service.durationMin > 0 ||
                                service.durationMax > 0
                                  ? `${service.durationMin}–${service.durationMax}`
                                  : service.duration > 0
                                  ? service.duration
                                  : "0"}{" "}
                                {service.durationUnit ||
                                  "minutes"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedService(service);

                                setOrderFields(
                                  service.orderFields || []
                                );

                                setLockPictures(
                                  service.lockPictures || []
                                );

                                setNewLockPicture("");

                                setShowServiceEditModal(true);
                              }}
                              className="shrink-0 rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition hover:bg-gray-600"
                            >
                              Edit
                            </button>

                            <button
                              onClick={async () => {
                                const confirmed =
                                  window.confirm(
                                    `Delete "${service.name}" service?`
                                  );

                                if (!confirmed) return;

                                try {
                                  await API.delete(
                                    `/services/${service._id}`
                                  );

                                  setServices((prev) =>
                                    prev.filter(
                                      (item) =>
                                        item._id !== service._id
                                    )
                                  );
                                } catch (error: any) {
                                  console.log(
                                    "DELETE SERVICE ERROR:",
                                    error.response?.data
                                  );

                                  alert(
                                    error.response?.data
                                      ?.message ||
                                      "Service o‘chirishda xatolik"
                                  );
                                }
                              }}
                              className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Devices */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Connected Devices
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Manage your active sessions
              </p>
            </div>

            <button
              onClick={handleLogoutOtherDevices}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Logout All Other Devices
            </button>
          </div>

          {sessions.length === 0 && (
            <p className="text-gray-400">
              No sessions found...
            </p>
          )}

          <div className="space-y-4">
            {sessions.map((session: any) => (
              <div
                key={session._id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5 shadow"
              >
                <p>
                  <b>Device:</b> {session.device}

                  {session.current && (
                    <span className="ml-2 rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      Current Device
                    </span>
                  )}
                </p>

                <p>
                  <b>Browser:</b> {session.browser}
                </p>

                <p>
                  <b>OS:</b> {session.os}
                </p>

                <p>
                  <b>IP:</b> {session.ipAddress}
                </p>

                <p>
                  <b>Status:</b>{" "}
                  {session.isActive
                    ? "🟢 Active"
                    : "🔴 Logged out"}
                </p>

                <p>
                  <b>Last Activity:</b>{" "}
                  {new Date(
                    session.lastActivity
                  ).toLocaleString()}
                </p>

                {!session.current && session.isActive && (
                  <div className="mt-4">
                    <button
                      onClick={() =>
                        handleLogoutDevice(session._id)
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
                    >
                      Logout Device
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* =========================
          ADD CATEGORY MODAL
      ========================== */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-xl bg-gray-800 p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-bold text-white">
              Add Category
            </h2>

            <input
              type="text"
              placeholder="Category name"
              value={categoryName}
              onChange={(e) =>
                setCategoryName(e.target.value)
              }
              className="mb-5 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowCategoryModal(false)
                }
                className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-500"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (!categoryName.trim()) {
                    alert("Category name kiriting");
                    return;
                  }

                  try {
                    const res = await API.post(
                      "/categories",
                      {
                        name: categoryName.trim(),
                        status: "active",
                        sortOrder: 0,
                      }
                    );

                    console.log(
                      "CATEGORY CREATED:",
                      res.data
                    );

                    setCategories((prev) => [
                      ...prev,
                      res.data.data,
                    ]);

                    setCategoryName("");
                    setShowCategoryModal(false);
                  } catch (error: any) {
                    console.log(
                      "CREATE CATEGORY ERROR:",
                      error.response?.data
                    );

                    alert(
                      error.response?.data?.message ||
                        "Category yaratishda xatolik"
                    );
                  }
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ADD SERVICE MODAL
      ========================== */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="my-8 w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-bold text-white">
              Add Service
            </h2>

            {selectedCategory && (
              <p className="mb-4 text-sm text-gray-400">
                Category:{" "}
                <span className="font-semibold text-white">
                  {selectedCategory}
                </span>
              </p>
            )}

            <input
              type="text"
              placeholder="Service name"
              value={serviceName}
              onChange={(e) =>
                setServiceName(e.target.value)
              }
              className="mb-4 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />

            <textarea
              placeholder="Service description"
              value={serviceDescription}
              onChange={(e) =>
                setServiceDescription(e.target.value)
              }
              className="mb-5 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
              rows={4}
            />

            <div className="mb-5 grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Price ($)"
                value={servicePrice}
                onChange={(e) =>
                  setServicePrice(e.target.value)
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
              />

              <select
                value={durationUnit}
                onChange={(e) =>
                  setDurationUnit(e.target.value)
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="minutes">
                  Minutes
                </option>
                <option value="hours">Hours</option>
              </select>

              <input
                type="number"
                placeholder="Min duration"
                value={durationMin}
                onChange={(e) =>
                  setDurationMin(e.target.value)
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
              />

              <input
                type="number"
                placeholder="Max duration"
                value={durationMax}
                onChange={(e) =>
                  setDurationMax(e.target.value)
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
              />
            </div>

            {/* Lock Pictures */}
            <div className="mb-5">
              <h3 className="mb-3 text-lg font-semibold text-white">
                Lock Pictures
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Lock picture URL"
                  value={newLockPicture}
                  onChange={(e) =>
                    setNewLockPicture(e.target.value)
                  }
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (!newLockPicture.trim()) {
                      alert(
                        "Lock picture URL kiriting"
                      );
                      return;
                    }

                    setLockPictures((prev) => [
                      ...prev,
                      newLockPicture.trim(),
                    ]);

                    setNewLockPicture("");
                  }}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                >
                  + Add
                </button>
              </div>

              {lockPictures.length > 0 && (
                <div className="mt-4 space-y-2">
                  {lockPictures.map(
                    (picture, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-gray-900 p-3"
                      >
                        <span className="truncate text-sm text-gray-300">
                          {picture}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setLockPictures((prev) =>
                              prev.filter(
                                (_, i) =>
                                  i !== index
                              )
                            )
                          }
                          className="ml-3 rounded bg-red-600 px-3 py-1 text-xs text-white"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Order Fields */}
            <div className="mb-5">
              <h3 className="mb-3 text-lg font-semibold text-white">
                Order Fields
              </h3>

              <input
                type="text"
                placeholder="Field name (e.g. imei)"
                value={newField.name}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    name: e.target.value,
                  })
                }
                className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
              />

              <input
                type="text"
                placeholder="Label (e.g. IMEI)"
                value={newField.label}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    label: e.target.value,
                  })
                }
                className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
              />

              <input
                type="text"
                placeholder="Placeholder (e.g. Enter IMEI)"
                value={newField.placeholder}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    placeholder: e.target.value,
                  })
                }
                className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
              />

              <select
                value={newField.type}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    type: e.target.value,
                  })
                }
                className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="textarea">
                  Textarea
                </option>
                <option value="select">Select</option>
                <option value="image">Image</option>
              </select>

              <label className="mb-3 flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={(e) =>
                    setNewField({
                      ...newField,
                      required: e.target.checked,
                    })
                  }
                />
                Required
              </label>

              <button
                type="button"
                onClick={() => {
                  if (
                    !newField.name.trim() ||
                    !newField.label.trim()
                  ) {
                    alert(
                      "Field name va label kiriting"
                    );
                    return;
                  }

                  setCreateOrderFields((prev) => [
                    ...prev,
                    {
                      ...newField,
                      name: newField.name.trim(),
                      label: newField.label.trim(),
                    },
                  ]);

                  setNewField({
                    name: "",
                    label: "",
                    type: "text",
                    required: false,
                    placeholder: "",
                  });
                }}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                + Add Field
              </button>

              {createOrderFields.length > 0 && (
                <div className="mt-4 space-y-2">
                  {createOrderFields.map(
                    (field, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-gray-900 p-3"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {field.label}
                          </p>

                          <p className="text-xs text-gray-400">
                            {field.name} · {field.type}
                            {field.required
                              ? " · Required"
                              : ""}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setCreateOrderFields(
                              (prev) =>
                                prev.filter(
                                  (_, i) =>
                                    i !== index
                                )
                            )
                          }
                          className="rounded bg-red-600 px-3 py-1 text-xs text-white"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Add Service Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowServiceModal(false);
                  setSelectedCategory(null);

                  setServiceName("");
                  setServiceDescription("");
                  setServicePrice("");
                  setDurationMin("");
                  setDurationMax("");
                  setDurationUnit("minutes");

                  setCreateOrderFields([]);

                  setLockPictures([]);
                  setNewLockPicture("");

                  setNewField({
                    name: "",
                    label: "",
                    type: "text",
                    required: false,
                    placeholder: "",
                  });
                }}
                className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-500"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (!serviceName.trim()) {
                    alert("Service name kiriting");
                    return;
                  }

                  if (!selectedCategory) {
                    alert("Category tanlanmagan");
                    return;
                  }

                  try {
                    const res = await API.post(
                      "/services",
                      {
                        name: serviceName.trim(),
                        description:
                          serviceDescription.trim(),
                        category: selectedCategory,
                        price:
                          Number(servicePrice) || 0,
                        durationMin:
                          Number(durationMin) || 0,
                        durationMax:
                          Number(durationMax) || 0,
                        durationUnit,
                        orderFields:
                          createOrderFields,
                        lockPictures:
                          lockPictures,
                      }
                    );

                    setServices((prev) => [
                      ...prev,
                      res.data.data,
                    ]);

                    setServiceName("");
                    setServiceDescription("");
                    setServicePrice("");
                    setDurationMin("");
                    setDurationMax("");
                    setDurationUnit("minutes");
                    setCreateOrderFields([]);

                    setLockPictures([]);
                    setNewLockPicture("");

                    setShowServiceModal(false);
                  } catch (error: any) {
                    console.log(
                      "CREATE SERVICE ERROR:",
                      error.response?.data
                    );

                    alert(
                      error.response?.data?.message ||
                        "Service yaratishda xatolik"
                    );
                  }
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          EDIT SERVICE MODAL
      ========================== */}
      {showServiceEditModal &&
        selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
            <div className="my-8 w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-xl">
              <h2 className="mb-5 text-xl font-bold text-white">
                Edit Service
              </h2>

              <p className="mb-4 text-sm text-gray-400">
                Category:{" "}
                <span className="font-semibold text-white">
                  {selectedService.category}
                </span>
              </p>

              <input
                type="text"
                placeholder="Service name"
                value={selectedService.name}
                onChange={(e) =>
                  setSelectedService({
                    ...selectedService,
                    name: e.target.value,
                  })
                }
                className="mb-4 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
              />

              <select
                value={
                  selectedService.status ||
                  "active"
                }
                onChange={(e) =>
                  setSelectedService({
                    ...selectedService,
                    status: e.target.value,
                  })
                }
                className="mb-4 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>

              <textarea
                placeholder="Service description"
                value={
                  selectedService.description ||
                  ""
                }
                onChange={(e) =>
                  setSelectedService({
                    ...selectedService,
                    description: e.target.value,
                  })
                }
                className="mb-5 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
                rows={4}
              />

              <div className="mb-5 grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Price ($)"
                  value={
                    selectedService.price ?? ""
                  }
                  onChange={(e) =>
                    setSelectedService({
                      ...selectedService,
                      price:
                        Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
                />

                <select
                  value={
                    selectedService.durationUnit ||
                    "minutes"
                  }
                  onChange={(e) =>
                    setSelectedService({
                      ...selectedService,
                      durationUnit:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="minutes">
                    Minutes
                  </option>

                  <option value="hours">
                    Hours
                  </option>
                </select>

                <input
                  type="number"
                  placeholder="Min duration"
                  value={
                    selectedService.durationMin ??
                    ""
                  }
                  onChange={(e) =>
                    setSelectedService({
                      ...selectedService,
                      durationMin:
                        Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
                />

                <input
                  type="number"
                  placeholder="Max duration"
                  value={
                    selectedService.durationMax ??
                    ""
                  }
                  onChange={(e) =>
                    setSelectedService({
                      ...selectedService,
                      durationMax:
                        Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
                />
              </div>

              {/* =========================
                  LOCK PICTURES - EDIT
              ========================== */}
              <div className="mb-5">
                <h3 className="mb-3 text-lg font-semibold text-white">
                  Lock Pictures
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Lock picture URL"
                    value={newLockPicture}
                    onChange={(e) =>
                      setNewLockPicture(
                        e.target.value
                      )
                    }
                    className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !newLockPicture.trim()
                      ) {
                        alert(
                          "Lock picture URL kiriting"
                        );
                        return;
                      }

                      setLockPictures((prev) => [
                        ...prev,
                        newLockPicture.trim(),
                      ]);

                      setNewLockPicture("");
                    }}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                  >
                    + Add
                  </button>
                </div>

                {lockPictures.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {lockPictures.map(
                      (picture, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg bg-gray-900 p-3"
                        >
                          <span className="truncate text-sm text-gray-300">
                            {picture}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setLockPictures(
                                (prev) =>
                                  prev.filter(
                                    (_, i) =>
                                      i !== index
                                  )
                              )
                            }
                            className="ml-3 rounded bg-red-600 px-3 py-1 text-xs text-white"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* =========================
                  ORDER FIELDS - EDIT
              ========================== */}
              <div className="mb-5">
                <h3 className="mb-3 text-lg font-semibold text-white">
                  Order Fields
                </h3>

                <input
                  type="text"
                  placeholder="Field name (e.g. imei)"
                  value={newField.name}
                  onChange={(e) =>
                    setNewField({
                      ...newField,
                      name: e.target.value,
                    })
                  }
                  className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
                />

                <input
                  type="text"
                  placeholder="Label (e.g. IMEI)"
                  value={newField.label}
                  onChange={(e) =>
                    setNewField({
                      ...newField,
                      label: e.target.value,
                    })
                  }
                  className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
                />

                <input
                  type="text"
                  placeholder="Placeholder (e.g. Enter IMEI)"
                  value={newField.placeholder}
                  onChange={(e) =>
                    setNewField({
                      ...newField,
                      placeholder: e.target.value,
                    })
                  }
                  className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
                />

                <select
                  value={newField.type}
                  onChange={(e) =>
                    setNewField({
                      ...newField,
                      type: e.target.value,
                    })
                  }
                  className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
                >
                  <option value="text">
                    Text
                  </option>

                  <option value="number">
                    Number
                  </option>

                  <option value="textarea">
                    Textarea
                  </option>

                  <option value="select">
                    Select
                  </option>

                  <option value="image">
                    Image
                  </option>
                </select>

                <label className="mb-3 flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={newField.required}
                    onChange={(e) =>
                      setNewField({
                        ...newField,
                        required:
                          e.target.checked,
                      })
                    }
                  />

                  Required
                </label>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      !newField.name.trim() ||
                      !newField.label.trim()
                    ) {
                      alert(
                        "Field name va label kiriting"
                      );
                      return;
                    }

                    setOrderFields((prev) => [
                      ...prev,
                      {
                        ...newField,
                        name: newField.name.trim(),
                        label:
                          newField.label.trim(),
                      },
                    ]);

                    setNewField({
                      name: "",
                      label: "",
                      type: "text",
                      required: false,
                      placeholder: "",
                    });
                  }}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                >
                  + Add Field
                </button>

                {orderFields.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {orderFields.map(
                      (field, index) => (
                        <div
                          key={index}
                          className="rounded-lg bg-gray-900 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">
                                {field.label}
                              </p>

                              <p className="text-xs text-gray-400">
                                {field.name} ·{" "}
                                {field.type}
                                {field.required
                                  ? " · Required"
                                  : ""}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setOrderFields(
                                  (prev) =>
                                    prev.filter(
                                      (_, i) =>
                                        i !==
                                        index
                                    )
                                )
                              }
                              className="rounded bg-red-600 px-3 py-1 text-xs text-white"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Edit Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedService(null);
                    setShowServiceEditModal(false);

                    setOrderFields([]);

                    setLockPictures([]);
                    setNewLockPicture("");

                    setNewField({
                      name: "",
                      label: "",
                      type: "text",
                      required: false,
                      placeholder: "",
                    });
                  }}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-500"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    try {
                      const res = await API.put(
                        `/services/${selectedService._id}`,
                        {
                          name: selectedService.name,
                          description:
                            selectedService.description,
                          category:
                            selectedService.category,
                          status:
                            selectedService.status ||
                            "active",

                          price:
                            Number(
                              selectedService.price
                            ) || 0,

                          durationMin:
                            Number(
                              selectedService.durationMin
                            ) || 0,

                          durationMax:
                            Number(
                              selectedService.durationMax
                            ) || 0,

                          durationUnit:
                            selectedService.durationUnit ||
                            "minutes",

                          orderFields:
                            orderFields,

                          lockPictures:
                            lockPictures,
                        }
                      );

                      setServices((prev) =>
                        prev.map((item) =>
                          item._id ===
                          selectedService._id
                            ? res.data.data
                            : item
                        )
                      );

                      setSelectedService(null);
                      setShowServiceEditModal(false);
                    } catch (error: any) {
                      console.log(
                        "UPDATE SERVICE ERROR:",
                        error.response?.data
                      );

                      alert(
                        error.response?.data
                          ?.message ||
                          "Service yangilashda xatolik"
                      );
                    }
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =========================
          EDIT CATEGORY MODAL
      ========================== */}
      {showCategoryEditModal &&
        selectedCategoryForEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-xl">
              <h2 className="mb-5 text-xl font-bold text-white">
                Edit Category
              </h2>

              <input
                type="text"
                placeholder="Category name"
                value={selectedCategoryForEdit.name}
                onChange={(e) =>
                  setSelectedCategoryForEdit({
                    ...selectedCategoryForEdit,
                    name: e.target.value,
                  })
                }
                className="mb-5 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
              />

              <select
                value={
                  selectedCategoryForEdit.status ||
                  "active"
                }
                onChange={(e) =>
                  setSelectedCategoryForEdit({
                    ...selectedCategoryForEdit,
                    status: e.target.value,
                  })
                }
                className="mb-5 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedCategoryForEdit(null);
                    setShowCategoryEditModal(false);
                  }}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-500"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    try {
                      const res = await API.put(
                        `/categories/${selectedCategoryForEdit._id}`,
                        {
                          name:
                            selectedCategoryForEdit.name,
                          status:
                            selectedCategoryForEdit.status,
                          sortOrder:
                            selectedCategoryForEdit.sortOrder,
                        }
                      );

                      setCategories((prev) =>
                        prev.map((item) =>
                          item._id ===
                          selectedCategoryForEdit._id
                            ? res.data.data
                            : item
                        )
                      );

                      setSelectedCategoryForEdit(null);
                      setShowCategoryEditModal(false);
                    } catch (error: any) {
                      console.log(
                        "UPDATE CATEGORY ERROR:",
                        error.response?.data
                      );

                      alert(
                        error.response?.data
                          ?.message ||
                          "Category yangilashda xatolik"
                      );
                    }
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
    </AuthGuard>
  );
}