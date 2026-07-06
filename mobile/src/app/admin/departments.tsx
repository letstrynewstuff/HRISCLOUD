// // src/app/admin/departments.tsx
// // Mobile Departments screen — mirrors the view-switching pattern used in
// // src/app/admin/employees.tsx (list / new / edit / profile / assign).

// import { useCallback, useEffect, useState } from "react";
// import { View, StyleSheet } from "react-native";
// import { router } from "expo-router";

// import C from "../../styles/colors";
// import { departmentApi } from "../../api/service/departmentApi";
// import { getEmployees } from "../../api/service/employeeApi";

// import DepartmentListView from "../../components/admin/department/DepartmentListView";
// import AddDepartmentForm from "../../components/admin/department/AddDepartmentForm";
// import DepartmentProfileView from "../../components/admin/department/DepartmentProfileView";
// import AssignEmployeesView from "../../components/admin/department/AssignEmployeesView";
// import DeleteDepartmentModal from "../../components/admin/department/DeleteDepartmentModal";
// import DeptToast from "../../components/admin/department/DeptToast";
// import { normalizeEmployee } from "../../hooks/deptHelpers";

// type ViewMode = "list" | "new" | "edit" | "profile" | "assign";

// export default function AdminDepartmentsScreen() {
//   const [activeView, setActiveView] = useState<ViewMode>("list");
//   const [activeDept, setActiveDept] = useState<any | null>(null);
//   const [deleteDept, setDeleteDept] = useState<any | null>(null);
//   const [deleting, setDeleting] = useState(false);
//   const [reloadToken, setReloadToken] = useState(0);
//   const [toast, setToast] = useState<{
//     msg: string;
//     type?: "success" | "error";
//   } | null>(null);

//   // Kept in sync so the profile/assign views can show current membership
//   // without re-fetching everything from DepartmentListView.
//   const [departments, setDepartments] = useState<any[]>([]);
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [empLoading, setEmpLoading] = useState(true);

//   const showToast = useCallback(
//     (msg: string, type: "success" | "error" = "success") =>
//       setToast({ msg, type }),
//     [],
//   );

//   const refreshAll = useCallback(async () => {
//     try {
//       const [deptRes, empRes] = await Promise.all([
//         departmentApi.list(),
//         getEmployees({ limit: 200 }),
//       ]);
//       setDepartments(deptRes?.departments ?? deptRes?.data ?? deptRes ?? []);
//       const rawEmp = empRes?.data ?? empRes?.employees ?? empRes ?? [];
//       setEmployees(
//         (Array.isArray(rawEmp) ? rawEmp : []).map(normalizeEmployee),
//       );
//     } catch {
//       // errors are surfaced by DepartmentListView's own fetches
//     } finally {
//       setEmpLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     refreshAll();
//   }, [refreshAll, reloadToken]);

//   const getEmployeesForDept = (deptId: string, deptName?: string) =>
//     employees.filter(
//       (emp) =>
//         emp.department_id === deptId ||
//         emp.department_id === String(deptId) ||
//         (deptName && emp.department?.toLowerCase() === deptName.toLowerCase()),
//     );

//   const getHeadEmployee = (dept: any) =>
//     dept?.head_id
//       ? (employees.find((e) => e.id === dept.head_id) ?? null)
//       : null;

//   const bump = () => setReloadToken((t) => t + 1);

//   const handleDeleteConfirm = async () => {
//     if (!deleteDept) return;
//     setDeleting(true);
//     try {
//       await departmentApi.remove(deleteDept.id);
//       showToast(`"${deleteDept.name}" deactivated`);
//       setDeleteDept(null);
//       bump();
//     } catch (err: any) {
//       showToast(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Failed to deactivate department",
//         "error",
//       );
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // ── New / Edit ──
//   if (activeView === "new" || activeView === "edit") {
//     return (
//       <View style={styles.screen}>
//         <AddDepartmentForm
//           mode={activeView === "new" ? "create" : "edit"}
//           department={activeView === "edit" ? activeDept : null}
//           departments={departments}
//           employees={employees}
//           onClose={() => setActiveView("list")}
//           onSuccess={() => {
//             bump();
//             showToast(
//               activeView === "new"
//                 ? "Department created successfully"
//                 : "Department updated successfully",
//             );
//             setActiveView("list");
//           }}
//         />
//         {toast && (
//           <DeptToast
//             msg={toast.msg}
//             type={toast.type}
//             onClose={() => setToast(null)}
//           />
//         )}
//       </View>
//     );
//   }

//   // ── Profile ──
//   if (activeView === "profile" && activeDept) {
//     const dept = departments.find((d) => d.id === activeDept.id) ?? activeDept;
//     const index = departments.findIndex((d) => d.id === dept.id);
//     return (
//       <View style={styles.screen}>
//         <DepartmentProfileView
//           department={dept}
//           deptEmployees={getEmployeesForDept(dept.id, dept.name)}
//           headEmployee={getHeadEmployee(dept)}
//           index={index >= 0 ? index : 0}
//           empLoading={empLoading}
//           onClose={() => setActiveView("list")}
//           onEdit={() => {
//             setActiveDept(dept);
//             setActiveView("edit");
//           }}
//           onAssign={() => {
//             setActiveDept(dept);
//             setActiveView("assign");
//           }}
//         />
//         {toast && (
//           <DeptToast
//             msg={toast.msg}
//             type={toast.type}
//             onClose={() => setToast(null)}
//           />
//         )}
//       </View>
//     );
//   }

//   // ── Assign Employees ──
//   if (activeView === "assign" && activeDept) {
//     return (
//       <View style={styles.screen}>
//         <AssignEmployeesView
//           department={activeDept}
//           employees={employees}
//           onClose={() => setActiveView("profile")}
//           onSuccess={() => {
//             bump();
//             setActiveView("profile");
//           }}
//           showToast={showToast}
//         />
//         {toast && (
//           <DeptToast
//             msg={toast.msg}
//             type={toast.type}
//             onClose={() => setToast(null)}
//           />
//         )}
//       </View>
//     );
//   }

//   // ── List (default) ──
//   return (
//     <View style={styles.screen}>
//       <DepartmentListView
//         reloadToken={reloadToken}
//         onClose={() => router.back()}
//         onCreate={() => {
//           setActiveDept(null);
//           setActiveView("new");
//         }}
//         onView={(dept) => {
//           setActiveDept(dept);
//           setActiveView("profile");
//         }}
//         onEdit={(dept) => {
//           setActiveDept(dept);
//           setActiveView("edit");
//         }}
//         onDelete={(dept) => setDeleteDept(dept)}
//         onAssign={(dept) => {
//           setActiveDept(dept);
//           setActiveView("assign");
//         }}
//         showToast={showToast}
//       />

//       <DeleteDepartmentModal
//         department={deleteDept}
//         loading={deleting}
//         onConfirm={handleDeleteConfirm}
//         onClose={() => setDeleteDept(null)}
//       />

//       {toast && (
//         <DeptToast
//           msg={toast.msg}
//           type={toast.type}
//           onClose={() => setToast(null)}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg },
// });


// src/app/admin/departments.tsx
// Mobile Departments screen — mirrors the view-switching pattern used in
// src/app/admin/employees.tsx (list / new / edit / profile / assign).

import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";

import C from "../../styles/colors";
import { departmentApi } from "../../api/service/departmentApi";
import { getEmployees } from "../../api/service/employeeApi";
import { Loader } from "../../hooks/loaderManager";

import DepartmentListView from "../../components/admin/department/DepartmentListView";
import AddDepartmentForm from "../../components/admin/department/AddDepartmentForm";
import DepartmentProfileView from "../../components/admin/department/DepartmentProfileView";
import AssignEmployeesView from "../../components/admin/department/AssignEmployeesView";
import DeleteDepartmentModal from "../../components/admin/department/DeleteDepartmentModal";
import DeptToast from "../../components/admin/department/DeptToast";
import { normalizeEmployee } from "../../hooks/deptHelpers";

type ViewMode = "list" | "new" | "edit" | "profile" | "assign";

export default function AdminDepartmentsScreen() {
  const [activeView, setActiveView] = useState<ViewMode>("list");
  const [activeDept, setActiveDept] = useState<any | null>(null);
  const [deleteDept, setDeleteDept] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [toast, setToast] = useState<{
    msg: string;
    type?: "success" | "error";
  } | null>(null);

  // Kept in sync so the profile/assign views can show current membership
  // without re-fetching everything from DepartmentListView.
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [empLoading, setEmpLoading] = useState(true);

  const showToast = useCallback(
    (msg: string, type: "success" | "error" = "success") =>
      setToast({ msg, type }),
    [],
  );

  const refreshAll = useCallback(async () => {
    Loader.show();
    try {
      const [deptRes, empRes] = await Promise.all([
        departmentApi.list(),
        getEmployees({ limit: 200 }),
      ]);
      setDepartments(deptRes?.departments ?? deptRes?.data ?? deptRes ?? []);
      const rawEmp = empRes?.data ?? empRes?.employees ?? empRes ?? [];
      setEmployees(
        (Array.isArray(rawEmp) ? rawEmp : []).map(normalizeEmployee),
      );
    } catch {
      // errors are surfaced by DepartmentListView's own fetches
    } finally {
      setEmpLoading(false);
      Loader.hide();
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll, reloadToken]);

  const getEmployeesForDept = (deptId: string, deptName?: string) =>
    employees.filter(
      (emp) =>
        emp.department_id === deptId ||
        emp.department_id === String(deptId) ||
        (deptName && emp.department?.toLowerCase() === deptName.toLowerCase()),
    );

  const getHeadEmployee = (dept: any) =>
    dept?.head_id
      ? (employees.find((e) => e.id === dept.head_id) ?? null)
      : null;

  const bump = () => setReloadToken((t) => t + 1);

  const handleDeleteConfirm = async () => {
    if (!deleteDept) return;
    setDeleting(true);
    Loader.show();
    try {
      await departmentApi.remove(deleteDept.id);
      showToast(`"${deleteDept.name}" deactivated`);
      setDeleteDept(null);
      bump();
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to deactivate department",
        "error",
      );
    } finally {
      setDeleting(false);
      Loader.hide();
    }
  };

  // ── New / Edit ──
  if (activeView === "new" || activeView === "edit") {
    return (
      <View style={styles.screen}>
        <AddDepartmentForm
          mode={activeView === "new" ? "create" : "edit"}
          department={activeView === "edit" ? activeDept : null}
          departments={departments}
          employees={employees}
          onClose={() => setActiveView("list")}
          onSuccess={() => {
            bump();
            showToast(
              activeView === "new"
                ? "Department created successfully"
                : "Department updated successfully",
            );
            setActiveView("list");
          }}
        />
        {toast && (
          <DeptToast
            msg={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </View>
    );
  }

  // ── Profile ──
  if (activeView === "profile" && activeDept) {
    const dept = departments.find((d) => d.id === activeDept.id) ?? activeDept;
    const index = departments.findIndex((d) => d.id === dept.id);
    return (
      <View style={styles.screen}>
        <DepartmentProfileView
          department={dept}
          deptEmployees={getEmployeesForDept(dept.id, dept.name)}
          headEmployee={getHeadEmployee(dept)}
          index={index >= 0 ? index : 0}
          empLoading={empLoading}
          onClose={() => setActiveView("list")}
          onEdit={() => {
            setActiveDept(dept);
            setActiveView("edit");
          }}
          onAssign={() => {
            setActiveDept(dept);
            setActiveView("assign");
          }}
        />
        {toast && (
          <DeptToast
            msg={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </View>
    );
  }

  // ── Assign Employees ──
  if (activeView === "assign" && activeDept) {
    return (
      <View style={styles.screen}>
        <AssignEmployeesView
          department={activeDept}
          employees={employees}
          onClose={() => setActiveView("profile")}
          onSuccess={() => {
            bump();
            setActiveView("profile");
          }}
          showToast={showToast}
        />
        {toast && (
          <DeptToast
            msg={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </View>
    );
  }

  // ── List (default) ──
  return (
    <View style={styles.screen}>
      <DepartmentListView
        reloadToken={reloadToken}
        onClose={() => router.back()}
        onCreate={() => {
          setActiveDept(null);
          setActiveView("new");
        }}
        onView={(dept) => {
          setActiveDept(dept);
          setActiveView("profile");
        }}
        onEdit={(dept) => {
          setActiveDept(dept);
          setActiveView("edit");
        }}
        onDelete={(dept) => setDeleteDept(dept)}
        onAssign={(dept) => {
          setActiveDept(dept);
          setActiveView("assign");
        }}
        showToast={showToast}
      />

      <DeleteDepartmentModal
        department={deleteDept}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteDept(null)}
      />

      {toast && (
        <DeptToast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
});