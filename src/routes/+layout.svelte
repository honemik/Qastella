<script lang="ts">
</script>

<nav class="main-nav">
  <a href="/">Dashboard</a>
  <a href="/exam-config">Mock Exam</a>
  <a href="/import-exam">Import Exam</a>
  <a href="/question-bank">Question Bank</a>
</nav>

<slot />

<style>
.main-nav {
  padding: 1rem;
  background-color: #f5f5f5;
  display: flex;
  gap: 1rem;
}
.main-nav a {
  text-decoration: none;
  color: inherit;
}
</style>
