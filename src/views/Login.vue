<script setup lang="ts"></script>
<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light" style="background-color: #e3f2fd">
    <div class="container-fluid">
      <a class="navbar-brand" href="javascript:void(0)">
        <img
          src="@/assets/logo.png"
          width="100"
          height="24"
          class="d-inline-block align-text-top"
        />
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbar"
        aria-controls="navbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse flex-grow-0" id="navbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 text-center">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="./login">登入</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="./register">註冊</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
